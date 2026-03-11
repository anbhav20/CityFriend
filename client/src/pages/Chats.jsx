import React from "react";
import MainLayout from "../components/MainLayout";
import MVP from "../components/MVP";

const Chats = () => {
  return (
    <MainLayout>
      <main className="flex flex-1 min-h-screen bg-gray-100  items-center justify-center">
        <section className="flex-1 ">
          <div className="text-center px-4">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl text-gray-500">💬</span>
            </div>
            <MVP child={"chats"}/>
          </div>
        </section>

      </main>
    </MainLayout>
  );
};

export default Chats;
