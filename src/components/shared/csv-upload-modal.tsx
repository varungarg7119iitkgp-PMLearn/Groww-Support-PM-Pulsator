"use client";

import { useState, useCallback, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
} from "lucide-react";

type Step = "upload" | "mapping" | "validation" | "importing" | "summary";

const SCHEMA_FIELDS = [
  { key: "star_rating", label: "Rating", required: true },
  { key: "review_date", label: "Date", required: true },
  { key: "review_text", label: "Review Text", required: true },
  { key: "platform", label: "Platform", required: true },
  { key: "author_name", label: "Author", required: false },
  { key: "app_version", label: "App Version", required: false },
  { key: "os_version", label: "OS Version", required: false },
  { key: "device_info", label: "Device Info", required: false },
];

interface ImportSummary {
  totalRows: number;
  validRows: number;
  inserted: number;
  duplicatesSkipped: number;
  skippedRows: number;
  skippedDetails: { row: number; reason: string }[];
}

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function CSVUploadModal({ open, onClose, onComplete }: CSVUploadModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: number;
    invalid: number;
    errors: string[];
  } | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setCsvHeaders([]);
    setMapping({});
    setCsvPreview([]);
    setValidationResult(null);
    setSummary(null);
    setError(null);
    setIsImporting(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const parseCSVHeaders = useCallback((text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return;

    const headerLine = lines[0];
    const headers = headerLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    setCsvHeaders(headers);

    const preview: string[][] = [];
    for (let i = 1; i < Math.min(lines.length, 4); i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      preview.push(cols);
    }
    setCsvPreview(preview);

    // Auto-map headers by name similarity
    const autoMapping: Record<string, string> = {};
    for (const field of SCHEMA_FIELDS) {
      const match = headers.find((h) => {
        const lower = h.toLowerCase();
        return (
          lower === field.key ||
          lower === field.label.toLowerCase() ||
          lower.includes(field.key.replace("_", " ")) ||
          lower.includes(field.label.toLowerCase())
        );
      });
      if (match) autoMapping[field.key] = match;
    }
    setMapping(autoMapping);
  }, []);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Only .csv files are accepted");
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File exceeds maximum size of 50 MB");
        return;
      }
      setError(null);
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCSVHeaders(text);
        setStep("mapping");
      };
      reader.readAsText(selectedFile.slice(0, 50000));
    },
    [parseCSVHeaders]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleValidate = useCallback(() => {
    const requiredFields = SCHEMA_FIELDS.filter((f) => f.required);
    const missingMappings = requiredFields.filter((f) => !mapping[f.key]);

    if (missingMappings.length > 0) {
      setError(
        `Map required columns: ${missingMappings.map((f) => f.label).join(", ")}`
      );
      return;
    }
    setError(null);

    const validCount = csvPreview.length;
    setValidationResult({
      valid: validCount,
      invalid: 0,
      errors: [],
    });
    setStep("validation");
  }, [mapping, csvPreview]);

  const handleImport = useCallback(async () => {
    if (!file) return;

    setIsImporting(true);
    setStep("importing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mapping", JSON.stringify(mapping));

      const response = await fetch("/api/upload/csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Import failed");
        setStep("validation");
        return;
      }

      setSummary(data.summary);
      setStep("summary");
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setStep("validation");
    } finally {
      setIsImporting(false);
    }
  }, [file, mapping, onComplete]);

  if (!open) return null;

  const requiredMapped = SCHEMA_FIELDS.filter((f) => f.required).every(
    (f) => mapping[f.key]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative mx-4 w-full max-w-2xl rounded-2xl bg-[var(--color-bg-card)] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-[var(--color-bg-card)] px-6 py-4 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Import CSV Reviews
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {step === "upload" && "Step 1 of 4 — Upload File"}
              {step === "mapping" && "Step 2 of 4 — Map Columns"}
              {step === "validation" && "Step 3 of 4 — Validate"}
              {step === "importing" && "Importing..."}
              {step === "summary" && "Step 4 of 4 — Summary"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-negative)]/10 px-4 py-3 text-sm text-[var(--color-negative)]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] py-16 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
            >
              <Upload className="mb-3 h-10 w-10 text-[var(--color-text-secondary)]" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Drop your CSV file here or click to browse
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                .csv files only, max 50 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <FileSpreadsheet className="h-4 w-4" />
                <span>
                  {file?.name} ({csvHeaders.length} columns detected)
                </span>
              </div>

              <div className="space-y-3">
                {SCHEMA_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between gap-4"
                  >
                    <label className="text-sm text-[var(--color-text-primary)] min-w-[120px]">
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-[var(--color-negative)]">*</span>
                      )}
                    </label>
                    <select
                      value={mapping[field.key] || ""}
                      onChange={(e) =>
                        setMapping((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="flex-1 rounded-lg border bg-[var(--color-bg-main)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                    >
                      <option value="">— Select column —</option>
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview */}
              {csvPreview.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Preview (first {csvPreview.length} rows)
                  </p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[var(--color-bg-main)]">
                          {csvHeaders.map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, i) => (
                          <tr key={i} className="border-t">
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="px-3 py-2 text-[var(--color-text-primary)] max-w-[200px] truncate"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setCsvHeaders([]);
                    setMapping({});
                  }}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Back
                </button>
                <button
                  onClick={handleValidate}
                  disabled={!requiredMapped}
                  className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Validate & Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Validation */}
          {step === "validation" && validationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-[var(--color-bg-main)] p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--color-accent)]">
                    {validationResult.valid}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Valid rows (preview)
                  </p>
                </div>
                <div className="rounded-lg border bg-[var(--color-bg-main)] p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--color-text-secondary)]">
                    {validationResult.invalid}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Skipped rows (preview)
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-[var(--color-accent)]/5 p-4">
                <p className="text-sm text-[var(--color-text-primary)]">
                  Ready to import <strong>{file?.name}</strong> with the
                  configured column mappings. Full validation will happen
                  server-side during import.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep("mapping")}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Import Reviews
                </button>
              </div>
            </div>
          )}

          {/* Importing */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-[var(--color-accent)]" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Importing reviews...
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                PII sanitization and duplicate detection in progress
              </p>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === "summary" && summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[var(--color-accent)]" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Import complete
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-[var(--color-bg-main)] p-3 text-center">
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {summary.totalRows}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Total Rows
                  </p>
                </div>
                <div className="rounded-lg border bg-[var(--color-bg-main)] p-3 text-center">
                  <p className="text-lg font-bold text-[var(--color-accent)]">
                    {summary.inserted}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Imported
                  </p>
                </div>
                <div className="rounded-lg border bg-[var(--color-bg-main)] p-3 text-center">
                  <p className="text-lg font-bold text-[var(--color-text-secondary)]">
                    {summary.duplicatesSkipped}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Duplicates
                  </p>
                </div>
                <div className="rounded-lg border bg-[var(--color-bg-main)] p-3 text-center">
                  <p className="text-lg font-bold text-[var(--color-star-2)]">
                    {summary.skippedRows}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Skipped
                  </p>
                </div>
              </div>

              {summary.skippedDetails.length > 0 && (
                <details className="rounded-lg border">
                  <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                    <Download className="mr-2 inline h-3.5 w-3.5" />
                    View skipped rows ({summary.skippedDetails.length})
                  </summary>
                  <div className="max-h-48 overflow-y-auto px-4 pb-3">
                    {summary.skippedDetails.map((s, i) => (
                      <p key={i} className="text-xs text-[var(--color-text-secondary)]">
                        Row {s.row}: {s.reason}
                      </p>
                    ))}
                  </div>
                </details>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClose}
                  className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
