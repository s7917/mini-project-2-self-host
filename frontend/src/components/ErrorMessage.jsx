export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="error-message">
      <span className="error-icon">⚠</span>
      <p>{message}</p>
    </div>
  );
}
