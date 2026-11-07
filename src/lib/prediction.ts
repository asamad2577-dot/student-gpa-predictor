export const PREDICTION_ENDPOINT =
  "https://students-gpa-predictor-mlops.onrender.com/predict";

export type PredictorValues = {
  semesterOneGpa: number;
  attendanceRate: number;
  assignmentsSubmittedRate: number;
  lmsLoginsPerWeek: number;
  previousQualificationGrade: number;
  admissionGrade: number;
};

export function hasValidPredictorRanges(values: PredictorValues): boolean {
  return (
    Number.isFinite(values.semesterOneGpa) &&
    values.semesterOneGpa >= 0 &&
    values.semesterOneGpa <= 4 &&
    Number.isFinite(values.attendanceRate) &&
    values.attendanceRate >= 0 &&
    values.attendanceRate <= 100 &&
    Number.isFinite(values.assignmentsSubmittedRate) &&
    values.assignmentsSubmittedRate >= 0 &&
    values.assignmentsSubmittedRate <= 100
  );
}

export function createPredictionPayload(values: PredictorValues) {
  return {
    gpa_semester_1: values.semesterOneGpa,
    attendance_rate: values.attendanceRate,
    assignments_submitted_rate: values.assignmentsSubmittedRate,
    lms_logins_per_week: values.lmsLoginsPerWeek,
    previous_qualification_grade: values.previousQualificationGrade,
    admission_grade: values.admissionGrade,
  };
}

export function readPredictedGpa(response: unknown): number {
  if (typeof response !== "object" || response === null) {
    throw new Error("The prediction server returned an invalid response.");
  }

  const value = (response as Record<string, unknown>)["Predicted GPA : "];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("The prediction server returned an invalid response.");
  }

  return value;
}