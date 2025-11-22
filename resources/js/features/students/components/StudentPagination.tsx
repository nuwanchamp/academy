import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {cn} from "@/lib/utils";

type Meta = {
    current_page: number;
    last_page: number;
};

type Props = {
    meta: Meta;
    onChangePage: (page: number) => void;
};

export const StudentPagination = ({meta, onChangePage}: Props) => {
    const pages = Array.from({length: meta.last_page});
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        className={cn(meta.current_page <= 1 && "pointer-events-none opacity-50")}
                        onClick={(event) => {
                            event.preventDefault();
                            onChangePage(meta.current_page - 1);
                        }}
                    />
                </PaginationItem>
                {pages.map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                        <PaginationItem key={pageNumber}>
                            <PaginationLink
                                href="#"
                                isActive={pageNumber === meta.current_page}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onChangePage(pageNumber);
                                }}
                            >
                                {pageNumber}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                {meta.last_page > 5 && <PaginationItem><PaginationEllipsis/></PaginationItem>}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        className={cn(meta.current_page >= meta.last_page && "pointer-events-none opacity-50")}
                        onClick={(event) => {
                            event.preventDefault();
                            onChangePage(meta.current_page + 1);
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
