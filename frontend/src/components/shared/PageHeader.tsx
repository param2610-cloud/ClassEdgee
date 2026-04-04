import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

const PageHeader = ({ title, description, breadcrumbs = [], actions }: PageHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {breadcrumbs.length > 0 ? (
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {crumb.href && !isLast ? (
                    <Link to={crumb.href} className="hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-foreground" : ""}>{crumb.label}</span>
                  )}
                  {!isLast ? <span>/</span> : null}
                </div>
              );
            })}
          </div>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
