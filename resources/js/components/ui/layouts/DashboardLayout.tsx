import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/ui/Sidebar.tsx";

export const DashboardLayout = () => {
  return (
      <div className="container-fluid">
          <Sidebar/>
          <main className={"py-10 w-svw-64 ml-74 pr-8"}>
              <Outlet/>
          </main>
      </div>
);
};
