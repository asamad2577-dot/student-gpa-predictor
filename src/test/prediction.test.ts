import { describe, expect, it } from "vitest";

import {
  createPredictionPayload,
  hasValidPredictorRanges,
  PREDICTION_ENDPOINT,
  readPredictedGpa,
} from "@/lib/prediction";

describe("student GPA prediction contract", () => {
  it("sends the six form values using the prediction API's exact keys", () => {
    expect(
      createPredictionPayload({
        semesterOneGpa: 3.25,
        attendanceRate: 91,
        assignmentsSubmittedRate: 88,
        lmsLoginsPerWeek: 14,
        previousQualificationGrade: 82,
        admissionGrade: 76,
      }),
    ).toEqual({
      gpa_semester_1: 3.25,
      attendance_rate: 91,
      assignments_submitted_rate: 88,
      lms_logins_per_week: 14,
      previous_qualification_grade: 82,
      admission_grade: 76,
    });
  });

  it("reads the numeric GPA from the prediction API response", () => {
    expect(readPredictedGpa({ "Predicted GPA : ": 3.42 })).toBe(3.42);
  });

  it("uses the prediction endpoint provided in the brief", () => {
    expect(PREDICTION_ENDPOINT).toBe(
      "https://students-gpa-predictor-mlops.onrender.com/predict",
    );
  });

  it("accepts the stated GPA and rate boundaries", () => {
    expect(
      hasValidPredictorRanges({
        semesterOneGpa: 4,
        attendanceRate: 0,
        assignmentsSubmittedRate: 100,
        lmsLoginsPerWeek: 0,
        previousQualificationGrade: 0,
        admissionGrade: 0,
      }),
    ).toBe(true);
  });

  it("rejects GPA and rate values outside the stated ranges", () => {
    expect(
      hasValidPredictorRanges({
        semesterOneGpa: 4.01,
        attendanceRate: 0,
        assignmentsSubmittedRate: 100,
        lmsLoginsPerWeek: 0,
        previousQualificationGrade: 0,
        admissionGrade: 0,
      }),
    ).toBe(false);
    expect(
      hasValidPredictorRanges({
        semesterOneGpa: 4,
        attendanceRate: 101,
        assignmentsSubmittedRate: 100,
        lmsLoginsPerWeek: 0,
        previousQualificationGrade: 0,
        admissionGrade: 0,
      }),
    ).toBe(false);
  });
});