const NotFound = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">This route does not exist in the current ClassEdgee build.</p>
    </div>
  );
};

export default NotFound;
