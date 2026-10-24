export function ServiceUnavailable() {
  return (
    <div className="notice notice-error" role="alert">
      <div>
        <strong>The lessons are taking a short break.</strong>
        <p>
          We could not reach the learning server just now. Nothing was lost — please
          try again in a moment.
        </p>
      </div>
      <a className="btn btn-secondary" href="">
        Try again
      </a>
    </div>
  );
}
