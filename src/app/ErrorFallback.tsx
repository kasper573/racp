export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      {process.env.showDetailsInErrorBoundary && (
        <pre>
          {Object.entries(error)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")}
        </pre>
      )}
      <button onClick={() => window.location.reload()}>Try again</button>
    </div>
  );
}
