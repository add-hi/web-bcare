import ViewProfile from "@/components/ViewProfile";

function Profile() {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-4rem)]">
      {/* 100vh - tinggi topbar (4rem = 64px) */}
      <ViewProfile />
    </div>
  );
}

export default Profile;
