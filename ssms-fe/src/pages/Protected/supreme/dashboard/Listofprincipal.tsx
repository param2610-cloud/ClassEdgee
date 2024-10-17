import {
    Table,
    TableHeader,
    TableRow,
    TableCell,
    TableCaption,
} from "@/components/ui/table";
import { domain } from "@/lib/constant";
import axios from "axios";
import { useEffect, useState } from "react";

const PrincipalList = () => {
    const [principals, setPrincipals] = useState([]);

    useEffect(() => {
        const fetchPrincipals = async () => {
            const response = await axios.get(
                `${domain}/api/v1/principal/list-of-principals`
            );
            console.log(response);

            const data = await response.data;
            setPrincipals(data);
        };
        fetchPrincipals();
    }, []);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Account Creation Date</TableCell>
                </TableRow>
            </TableHeader>
            <tbody>
                {principals.map((principal: any) => (
                    <TableRow key={principal._id}>
                        <TableCell>{principal.fullName}</TableCell>
                        <TableCell>{principal.contactInfo.email}</TableCell>
                        <TableCell>
                            {new Date(
                                principal.accountCreationDate
                            ).toLocaleDateString()}
                        </TableCell>
                    </TableRow>
                ))}
            </tbody>
            <TableCaption>List of Principals</TableCaption>
        </Table>
    );
};
export default PrincipalList;
