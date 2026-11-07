import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { PREDICTION_ENDPOINT, readPredictedGpa } from "@/lib/prediction";

const predictionRequestSchema = z.object({
  gpa_semester_1: z.number().min(0).max(4),
  attendance_rate: z.number().min(0).max(100),
  assignments_submitted_rate: z.number().min(0).max(100),
  lms_logins_per_week: z.number().min(0),
  previous_qualification_grade: z.number().min(0),
  admission_grade: z.number().min(0),
});

export const predictGpa = createServerFn({ method: "POST" })
  .inputValidator((input) => predictionRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const response = await fetch(PREDICTION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("The prediction service is unavailable.");
    }

    const result: unknown = await response.json();
    return { prediction: readPredictedGpa(result) };
  });