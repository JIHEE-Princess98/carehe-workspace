import "./globals.css";
export const metadata = {
  title: "Carehe Issue Workspace",
  description: "프로젝트·요구사항·결함 통합 관리",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
