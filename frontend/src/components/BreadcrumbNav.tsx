import { Link, useLocation } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "./ui/breadcrumb";
import React from "react";

export const BreadcrumbNav = () => {
    const location = useLocation();
    const pathSegments = location.pathname
        .split("/")
        .filter((segment) => segment);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink as={Link} to="/">
                        Home
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {pathSegments.map((segment, index) => {
                    const path = `/${pathSegments
                        .slice(0, index + 1)
                        .join("/")}`;
                    const isLast = index === pathSegments.length - 1;

                    return (
                        <React.Fragment key={path}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>
                                        {segment.charAt(0).toUpperCase() +
                                            segment.slice(1)}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink as={Link} to={path}>
                                        {segment.charAt(0).toUpperCase() +
                                            segment.slice(1)}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
