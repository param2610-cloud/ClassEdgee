interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {description || "This route is part of the rebuild and will be completed in the next implementation slices."}
      </p>
    </div>
  );
};

export default ComingSoon;
