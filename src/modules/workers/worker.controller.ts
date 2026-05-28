import { defineRoute } from "../../handlers/routes.js";
import { prisma } from "../../shared/utils/prismaClient.js";
import { createWorkerSchema, updateWorkerSchema } from "./worker.validation.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import { ZodError } from "zod/v3";

export const addNewWorker = defineRoute(async (req, res) => {
  try {
    const workerDetails = createWorkerSchema.parse(req.body);

    const existingWorker = await prisma.worker.findFirst({
      where: {
        OR: [
          {
            employeeCode: workerDetails.employeeCode,
          },

          ...(workerDetails.email
            ? [
                {
                  email: workerDetails.email,
                },
              ]
            : []),

          ...(workerDetails.phone
            ? [
                {
                  phone: workerDetails.phone,
                },
              ]
            : []),
        ],
      },
    });

    if (existingWorker) {
      return ApiResponse.error(res, {
        statusCode: 409,
        message: "Worker already exists",
      });
    }

    const worker = await prisma.worker.create({
      data: workerDetails,
    });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: "Worker created successfully",

      data: worker,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, {
        statusCode: 400,

        message: "Validation failed",

        errors: error.errors.map((err) => ({
          field: err.path.join("."),

          message: err.message,
        })),
      });
    }

    console.error(error);

    return ApiResponse.error(res, {
      statusCode: 500,

      message: "Internal server error",
    });
  }
});

export const updateWorker = defineRoute(async (req, res) => {
  try {
    const workerId = String(req.params.id);

    if (!workerId) {
      return ApiResponse.error(res, {
        statusCode: 400,

        message: "Worker ID is required",
      });
    }

    const workerDetails = updateWorkerSchema.parse(req.body);

    const existingWorker = await prisma.worker.findUnique({
      where: {
        id: workerId,
      },
    });

    if (!existingWorker) {
      return ApiResponse.error(res, {
        statusCode: 404,

        message: "Worker not found",
      });
    }

    if (workerDetails.email) {
      const emailExists = await prisma.worker.findFirst({
        where: {
          email: workerDetails.email,

          NOT: {
            id: workerId,
          },
        },
      });

      if (emailExists) {
        return ApiResponse.error(res, {
          statusCode: 409,

          message: "Email already exists",
        });
      }
    }

    if (workerDetails.phone) {
      const phoneExists = await prisma.worker.findFirst({
        where: {
          phone: workerDetails.phone,

          NOT: {
            id: workerId,
          },
        },
      });

      if (phoneExists) {
        return ApiResponse.error(res, {
          statusCode: 409,

          message: "Phone already exists",
        });
      }
    }

    const updatedWorker = await prisma.worker.update({
      where: {
        id: workerId,
      },

      data: workerDetails,
    });

    return ApiResponse.success(res, {
      statusCode: 200,

      message: "Worker updated successfully",

      data: updatedWorker,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, {
        statusCode: 400,

        message: "Validation failed",

        errors: error.errors.map((err) => ({
          field: err.path.join("."),

          message: err.message,
        })),
      });
    }

    console.error(error);

    return ApiResponse.error(res, {
      statusCode: 500,

      message: "Internal server error",
    });
  }
});
