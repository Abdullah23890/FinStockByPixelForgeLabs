import Api from "../Axios/axios.js";

export const downloadReportPdf = async (type, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await Api.get(`/reports/${type}?${params}`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}_report.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};