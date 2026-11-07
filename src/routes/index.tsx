import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, ExternalLink, GraduationCap, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPredictionPayload,
  hasValidPredictorRanges,
  type PredictorValues,
} from "@/lib/prediction";
import { predictGpa } from "@/lib/predict-gpa.functions";

const repoUrl = "https://github.com/abdul-samad-ml/students-gpa-predictor-mlops";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Performance Predictor | KFUEIT" },
      {
        name: "description",
        content:
          "Forecast Semester 2 academic outcomes with a student GPA predictor powered by a Ridge regression model.",
      },
      { property: "og:title", content: "Student Performance Predictor | KFUEIT" },
      {
        property: "og:description",
        content:
          "A machine learning regression model that forecasts Semester 2 outcomes from student performance metrics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "icon", href: "https://kfueit.edu.pk/favicon.ico", type: "image/x-icon" }],
  }),
  component: Index,
});

const fields = [
  {
    name: "semesterOneGpa",
    label: "Semester 1 GPA",
    min: 0,
    max: 4,
    step: 0.01,
    hint: "Scale of 0.0 to 4.0",
    placeholder: "e.g. 3.25",
  },
  {
    name: "attendanceRate",
    label: "Attendance Rate %",
    min: 0,
    max: 100,
    step: 0.1,
    hint: "Percentage · 0 to 100",
    placeholder: "e.g. 91",
  },
  {
    name: "assignmentsSubmittedRate",
    label: "Assignments Submitted Rate %",
    min: 0,
    max: 100,
    step: 0.1,
    hint: "Percentage · 0 to 100",
    placeholder: "e.g. 88",
  },
  {
    name: "lmsLoginsPerWeek",
    label: "LMS Logins Per Week",
    min: 0,
    step: 1,
    hint: "Average weekly logins",
    placeholder: "e.g. 14",
  },
  {
    name: "previousQualificationGrade",
    label: "Previous Qualification Grade",
    min: 0,
    step: 0.01,
    hint: "Enter your grade",
    placeholder: "e.g. 82",
  },
  {
    name: "admissionGrade",
    label: "Admission Grade",
    min: 0,
    step: 0.01,
    hint: "Enter your admission grade",
    placeholder: "e.g. 76",
  },
] as const;

function Index() {
  const submitPrediction = useServerFn(predictGpa);
  const [values, setValues] = useState<Record<keyof PredictorValues, string>>({
    semesterOneGpa: "",
    attendanceRate: "",
    assignmentsSubmittedRate: "",
    lmsLoginsPerWeek: "",
    previousQualificationGrade: "",
    admissionGrade: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setPrediction(null);
    setError(null);

    const numericValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)]),
    ) as PredictorValues;

    if (!hasValidPredictorRanges(numericValues)) {
      setError("Enter a Semester 1 GPA from 0 to 4 and rates from 0 to 100.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await submitPrediction({ data: createPredictionPayload(numericValues) });
      setPrediction(result.prediction);
    } catch (submitError) {
      setError(
        submitError instanceof Error && submitError.message.includes("invalid response")
          ? submitError.message
          : "Error connecting to the prediction server. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-predictor-line bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="KFUEIT home">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap aria-hidden="true" className="size-5" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              KFUEIT <span className="font-normal text-muted-foreground">/ Analytics</span>
            </span>
          </a>
          <span className="hidden text-xs font-medium text-muted-foreground sm:block">
            ACADEMIC PERFORMANCE · 2026
          </span>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8">
        <section className="mx-auto max-w-3xl pb-10 pt-12 sm:pb-12 sm:pt-16">
          <p className="mb-4 text-xs font-semibold uppercase text-primary">Academic analytics</p>
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Student Performance Predictor
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            A machine learning regression model built to forecast Semester 2 academic outcomes
            based on initial performance metrics.
          </p>
        </section>

        <section aria-labelledby="predictor-title" className="mx-auto max-w-3xl pb-14">
          <div className="rounded-lg border border-predictor-line bg-card p-5 predictor-shadow sm:p-8">
            <div className="mb-7 border-b border-predictor-line pb-5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="size-2 rounded-full bg-predictor-success" />
                PREDICTION MODEL
              </div>
              <h2 id="predictor-title" className="mt-3 text-lg font-semibold text-foreground">
                Enter your performance metrics
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Provide your academic details to calculate an estimate.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label htmlFor={field.name} className="text-sm font-medium text-foreground">
                      {field.label}
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      inputMode="decimal"
                      required
                      min={field.min}
                      max={"max" in field ? field.max : undefined}
                      step={field.step}
                      placeholder={field.placeholder}
                      value={values[field.name]}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.name]: event.target.value,
                        }))
                      }
                      className="h-11 rounded-md border-predictor-line bg-background px-3.5 text-sm shadow-none focus-visible:ring-2"
                    />
                    <p className="text-xs text-muted-foreground">{field.hint}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-predictor-line pt-5">
                <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <LoaderCircle aria-hidden="true" className="animate-spin" />
                      Calculating…
                    </>
                  ) : (
                    <>
                      Calculate Predicted GPA
                      <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </Button>

                {prediction !== null && (
                  <div
                    role="status"
                    className="mt-5 flex items-start gap-3 rounded-md border border-predictor-success/20 bg-predictor-success-surface p-4"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-predictor-success/10 text-predictor-success">
                      <Check aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Predicted Semester 2 GPA
                      </p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-predictor-success">
                        {prediction.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <p
                    role="alert"
                    className="mt-5 rounded-md border border-predictor-error/20 bg-predictor-error-surface px-4 py-3 text-sm text-predictor-error"
                  >
                    {error}
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-3xl border-t border-predictor-line py-10 sm:py-12">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <span className="h-px w-5 bg-primary" />
            About the Developer
          </div>
          <div className="flex flex-col gap-5 rounded-lg border border-predictor-line bg-card p-5 sm:flex-row sm:items-start sm:p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-lg font-semibold text-secondary-foreground">
              AS
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Abdul Samad</h2>
              <p className="mt-1 text-sm font-medium text-primary">ML Engineer &amp; Data Scientist</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Abdul Samad is a Machine Learning developer and a BS Data Science student at Khwaja
                Fareed University of Engineering and Information Technology (KFUEIT) in Rahim Yar
                Khan, Pakistan. He specializes in Python, algorithmic script engineering, and
                end-to-end full-stack AI deployment.
              </p>
              <div className="mt-5 border-t border-predictor-line pt-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  The public repository includes the FastAPI prediction service, Ridge regression
                  model, preprocessing scaler, and the student dataset. The model derives grade
                  trend and prior academic strength from the supplied grades before predicting.
                </p>
                <Button asChild variant="outline" className="mt-4 gap-2">
                  <a href={repoUrl} target="_blank" rel="noreferrer">
                    View project on GitHub
                    <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-predictor-line bg-predictor-surface">
        <div className="mx-auto max-w-6xl px-5 py-5 text-center text-xs leading-5 text-muted-foreground sm:px-8 sm:text-left">
          © 2026 Abdul Samad | Built with React &amp; FastAPI | Deployed via Render
        </div>
      </footer>
    </div>
  );
}
