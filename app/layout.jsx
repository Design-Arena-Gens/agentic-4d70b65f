export const metadata = {
  title: 'Video Studio',
  description: 'Record, play, and download videos in your browser.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
