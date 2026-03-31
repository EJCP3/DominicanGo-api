import * as Minio from 'minio';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Validate environment variables
const ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const PORT = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY || '';
const SECRET_KEY = process.env.MINIO_SECRET_KEY || '';
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'dominicango-uploads';
const USE_SSL = process.env.MINIO_USE_SSL === 'true'; // Default a false a menos que se fuerce, 9000 suele ser HTTP puro

export const minioClient = new Minio.Client({
  endPoint: ENDPOINT,
  port: PORT,
  useSSL: USE_SSL,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
});

/**
 * Ensures that the main bucket exists before operating.
 */
export const initializeBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      // Crear bucket si no existe
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket ${BUCKET_NAME} creado exitosamente.`);
    }

    // Configurar política de lectura pública (Public Read)
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetBucketLocation", "s3:ListBucket"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}`],
        },
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    console.log(`🔓 Política de lectura pública aplicada o verificada para ${BUCKET_NAME}`);
  } catch (error) {
    console.error('Error checking or creating MinIO bucket:', error);
  }
};

/**
 * Optimizes an image buffer into a lightweight WebP format using Sharp.
 * - Max width: 1200px
 * - Format: WebP
 * - Quality: 80%
 */
const optimizeImage = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    .resize(1200, undefined, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .webp({ quality: 80 })
    .toBuffer();
};

/**
 * Uploads a Base64 string image to the MinIO bucket.
 * The image will be optimized into WebP format before uploading.
 * 
 * @param base64String Processing input (e.g. data:image/png;base64,... OR pure base64)
 * @param folder The folder path prefix inside the bucket (e.g., 'blogs' or 'destinations')
 * @returns The public URL of the uploaded optimized image
 */
export const uploadBase64Image = async (base64String: string, folder: string): Promise<string> => {
  // If the base64 contains the data URL prefix (data:image/...;base64,), strip it
  const base64Data = base64String.includes('base64,') 
    ? base64String.split('base64,')[1] 
    : base64String;

  // Convert string to raw Buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // "El Gimnasio" - Process buffer with Sharp
  const optimizedBuffer = await optimizeImage(buffer);

  // Generate a unique filename and set headers
  const fileName = `${folder}/${uuidv4()}.webp`;
  const metaData = {
    'Content-Type': 'image/webp',
  };

  try {
    // Upload optimized buffer to MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      optimizedBuffer,
      optimizedBuffer.length, // Required length for buffers
      metaData
    );

    // Formulate the public URL (assuming "Public Read" bucket policy)
    const protocol = USE_SSL ? 'https' : 'http';
    const publicUrl = `${protocol}://${ENDPOINT}:${PORT}/${BUCKET_NAME}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to MinIO:', error);
    throw new Error('No se pudo cargar la imagen a los servidores optimizados.');
  }
};
