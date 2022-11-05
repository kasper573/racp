export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      {process.env.showDetailsInErrorBoundary && (
        <pre>
          Name: {error.name + "\n"}
          Message: {error.message + "\n"}
          Stack: {error.stack}
        </pre>
      )}
      <button onClick={() => window.location.reload()}>Try again</button>
    </div>
  );
}
