export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Not Found | Khalai Makhlooq</title>
        <style>{`
          body {
            background-color: #010301;
            color: #ffffff;
            font-family: monospace;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .container {
            border: 1px solid rgba(255, 255, 255, 0.1);
            background-color: rgba(255, 255, 255, 0.02);
            padding: 2.5rem;
            border-radius: 1.5rem;
          }
          h2 {
            color: #a3e635;
            margin-top: 0;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }
          p {
            color: #a3a3a3;
            font-size: 0.9rem;
          }
          a {
            display: inline-block;
            margin-top: 1.5rem;
            color: #000000;
            background-color: #a3e635;
            padding: 0.5rem 1.5rem;
            border-radius: 0.75rem;
            text-decoration: none;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.1em;
          }
          a:hover {
            opacity: 0.9;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h2>Signal Lost // 404</h2>
          <p>The requested coordinates do not contain any active KMHQ dispatches.</p>
          <a href="/">Return to Bridge</a>
        </div>
      </body>
    </html>
  );
}
