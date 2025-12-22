export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="bg-black overflow-hidden">
        {children}
      </body>
    </html>
  );
}
