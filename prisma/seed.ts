import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const baseProvinces = {
    "santo-domingo": {
        name: "Santo Domingo", region: "Sur",
        description: "La capital vibrant y llena de historia, donde el pasado colonial se encuentra con la vida moderna del Caribe.",
        color: "#4a90d9"
    },
    "la-altagracia": {
        name: "La Altagracia", region: "Este",
        description: "Hogar de Punta Cana, el destino turístico más famoso del Caribe con playas paradisíacas.",
        color: "#e8c547"
    },
    "puerto-plata": {
        name: "Puerto Plata", region: "Norte",
        description: "La Costa de Ámbar, con playas doradas, montañas verdes y el encanto de una ciudad victoriana.",
        color: "#e67e22"
    },
    "samana": {
        name: "Samaná", region: "Noreste",
        description: "Naturaleza virgen, ballenas jorobadas y las playas más espectaculares del país.",
        color: "#27ae60"
    },
    "santiago": {
        name: "Santiago", region: "Norte",
        description: "La Ciudad Corazón, segunda ciudad más grande, centro cultural y capital del tabaco.",
        color: "#8e44ad"
    },
    "la-romana": {
        name: "La Romana", region: "Este",
        description: "Lujo caribeño con campos de golf, marinas exclusivas y la artística Altos de Chavón.",
        color: "#c0392b"
    },
    "barahona": {
        name: "Barahona", region: "Sur",
        description: "La Perla del Sur. Donde las montañas se encuentran con el mar en paisajes dramáticos.",
        color: "#16a085"
    },
    "la-vega": {
        name: "La Vega", region: "Norte",
        description: "Corazón cultural del Cibao con el mejor carnaval del país y naturaleza exuberante.",
        color: "#2980b9"
    },
    "pedernales": {
        name: "Pedernales", region: "Sur",
        description: "El último paraíso virgen del Caribe con ecosistemas únicos y belleza natural incomparable.",
        color: "#1abc9c"
    },
    "monte-cristi": {
        name: "Monte Cristi", region: "Noroeste",
        description: "El Morro y los cayos, historia de piratas y el salvaje noroeste dominicano.",
        color: "#d35400"
    },
    "azua": {
        name: "Azua", region: "Sur",
        description: "Tierra de historia y naturaleza, con playas tranquilas y montañas imponentes al sur del país.",
        color: "#c0d8e8"
    },
    "bahoruco": {
        name: "Bahoruco", region: "Sur",
        description: "Provincia de naturaleza virgen con picos montañosos y biodiversidad excepcional.",
        color: "#a0c8d8"
    },
    "dajabon": {
        name: "Dajabón", region: "Noroeste",
        description: "La provincia fronteriza por excelencia, puerta de comercio y cultura binacional.",
        color: "#b8cce0"
    },
    "duarte": {
        name: "Duarte", region: "Noreste",
        description: "La cuna del arroz dominicano, con paisajes tropicales y ríos de aguas cristalinas.",
        color: "#f8a0a0"
    },
    "elias-pina": {
        name: "Elías Piña", region: "Oeste",
        description: "Frontera y montaña, una provincia de contrastes entre la selva y el límite fronterizo.",
        color: "#c8d8e8"
    },
    "el-seibo": {
        name: "El Seibo", region: "Este",
        description: "Tierras ganaderas y de caña, con ríos, cuevas y la tranquilidad del oriente dominicano.",
        color: "#a0d0c0"
    },
    "espaillat": {
        name: "Espaillat", region: "Norte",
        description: "El municipio de Moca, tierra de cacaos, cafés y el famoso dulce de coco espaillateño.",
        color: "#f4b8b0"
    },
    "hato-mayor": {
        name: "Hato Mayor", region: "Este",
        description: "Territorio ganadero con ríos, cuevas y acceso a reservas naturales del este dominicano.",
        color: "#f0c8a0"
    },
    "hermanas-mirabal": {
        name: "Hermanas Mirabal", region: "Norte",
        description: "Homenaje eterno a las Mariposas, tierra de cacao, naturaleza y memoria histórica.",
        color: "#f47fb0"
    },
    "independencia": {
        name: "Independencia", region: "Sur",
        description: "Lago salado, iguanas gigantes y el parque nacional más grande del Caribe en su frontera.",
        color: "#c0b8d8"
    },
    "maria-trinidad-sanchez": {
        name: "María Trinidad Sánchez", region: "Noreste",
        description: "Costa atlántica salvaje con playas escondidas, manglares y acceso al Parque Los Haitises.",
        color: "#88d4bc"
    },
    "monsenor-nouel": {
        name: "Monseñor Nouel", region: "Norte",
        description: "Corazón del país, con ríos navegables, presa y conexión con la cordillera Central.",
        color: "#e8d4a0"
    },
    "monte-plata": {
        name: "Monte Plata", region: "Este",
        description: "Parque Los Haitises y una naturaleza exuberante de ríos, cuevas y manglares únicos.",
        color: "#d4c4e8"
    },
    "peravia": {
        name: "Peravia", region: "Sur",
        description: "Dunas de arena únicas en el Caribe, playas tranquilas y la alegre ciudad de Baní.",
        color: "#b4e0c8"
    },
    "san-cristobal": {
        name: "San Cristóbal", region: "Sur",
        description: "La cuna de la Constitución dominicana de 1844, con cuevas, playas y montañas.",
        color: "#d4dca0"
    },
    "san-jose-de-ocoa": {
        name: "San José de Ocoa", region: "Sur",
        description: "La tierra del aguacate y el café de altura, con cascadas y ecoturismo de montaña.",
        color: "#e8c8d0"
    },
    "san-juan": {
        name: "San Juan", region: "Oeste",
        description: "San Juan de la Maguana, portal al suroeste con el misterioso Corral de los Indios.",
        color: "#f0d870"
    },
    "san-pedro-de-macoris": {
        name: "San Pedro de Macorís", region: "Este",
        description: "La cuna del béisbol dominicano y de grandes jugadores de Grandes Ligas.",
        color: "#ccdcc4"
    },
    "santiago-rodriguez": {
        name: "Santiago Rodríguez", region: "Noroeste",
        description: "Tabaco artesanal, ríos salvajes y el Parque Nacional Nalga de Maco en las alturas del noroeste.",
        color: "#c8b4dc"
    },
    "valverde": {
        name: "Valverde", region: "Noroeste",
        description: "Tierra de arroz y plantaciones, capital del Noroeste con paisajes agrícolas únicos.",
        color: "#b8d4a0"
    },
    "distrito-nacional": {
        name: "Distrito Nacional", region: "Sur",
        description: "Santo Domingo, el corazón político y cultural de la nación dominicana.",
        color: "#e8a898"
    },
    "sanchez-ramirez": {
        name: "Sánchez Ramírez", region: "Norte",
        description: "Tierra del ámbar azul y la caoba, provincia central con ríos y tradiciones campesinas.",
        color: "#a8d8b0"
    }
};

async function main() {
    console.log("Start seeding provinces...");
    
    for (const [slug, data] of Object.entries(baseProvinces)) {
        await prisma.province.upsert({
            where: { id: slug },
            update: data,
            create: {
                id: slug,
                ...data
            }
        });
    }
    
    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
