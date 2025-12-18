const API_BASE_URL = "https://healthcare-tvfz.onrender.com";

export const processPatientCase = async (
  medicalReportText,
  currentSymptoms
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/process_case/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        medical_report_text: medicalReportText,
        current_symptoms: currentSymptoms,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (error) {
    console.error("Error processing patient case:", error);
    throw error;
  }
};
