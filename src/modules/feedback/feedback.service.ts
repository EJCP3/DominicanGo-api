import { prisma } from '../../lib/prisma';
import { FeedbackType, FeedbackStatus } from '@prisma/client';

export interface CreateFeedbackInput {
  type: FeedbackType;
  content: string;
  title?: string;
  userId?: string;
  resourceId?: string;
  resourceType?: string;
}

export const createFeedback = async (data: CreateFeedbackInput) => {
  return await prisma.feedback.create({
    data: {
      type: data.type,
      content: data.content,
      title: data.title,
      userId: data.userId,
      resourceId: data.resourceId,
      resourceType: data.resourceType,
      status: FeedbackStatus.PENDING,
    },
  });
};

export const getAllFeedbacks = async () => {
  return await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true, foto: true }
      }
    }
  });
};

export const getFeedbackById = async (id: string) => {
  return await prisma.feedback.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, foto: true }
      }
    }
  });
};

export const updateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
  return await prisma.feedback.update({
    where: { id },
    data: { status },
  });
};
