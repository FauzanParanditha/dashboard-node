import { clsx } from "clsx";
import { useEffect, useState } from "react";

type Props = {
  paginate: {
    currentPage: number | string;
    totalPages: number;
    perPage: number | null;
    totalRecords: number | null;
    recordsOnPage: number | null;
  };
  onPageChange: (page: number) => void;
  limit: number | string;
};

export default function Pagination({
  paginate,
  onPageChange,
  limit = 1,
}: Props) {
  const { totalPages, currentPage } = paginate;
  const [rangePage, setRangePage] = useState([]);
  const [previus, setPrevius] = useState(1);
  const [next, setNext] = useState(1);

  useEffect(() => {
    setPrevius(currentPage === 1 ? 1 : Number(currentPage) - 1);
    setNext(currentPage === totalPages ? totalPages : Number(currentPage) + 1);
    pageRange();
  }, [currentPage, totalPages]);

  const pageRange = () => {
    const range = [];
    const pages: any = [];
    let l: any;
    const left = Number(currentPage) - Number(limit);
    const right = Number(currentPage) + Number(limit) + 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }
    range.forEach(function (i) {
      if (l) {
        if (i - l === 2) {
          pages.push(l + 1);
        } else if (i - l !== 1) {
          pages.push("...");
        }
      }
      pages.push(i);
      l = i;
    });
    //set state
    setRangePage(pages);
  };
  return (
    <nav>
      <ul className="m-2 flex items-center justify-center">
        <li className="page-item">
          <button
            className={clsx(
              "relative block rounded-l-md border px-3 py-1 text-xl text-slate-500 dark:border-slate-500"
            )}
            onClick={() => onPageChange(Number(previus))}
            disabled={Number(currentPage) === 1}
          >
            <span aria-hidden="true">«</span>
            <span className="sr-only">Previous</span>
          </button>
        </li>
        {rangePage?.map((link: any, index: any) => (
          <li className="page-item" key={index}>
            <button
              className={clsx("relative block border px-3 py-1 text-xl", {
                ["cursor-default border-red-800 bg-red-800 text-slate-100"]:
                  currentPage === link,
                ["bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white dark:border-slate-500 dark:bg-slate-800"]:
                  currentPage !== link,
              })}
              onClick={() => onPageChange(Number(link))}
            >
              {link}
            </button>
          </li>
        ))}
        <li className="page-item">
          <button
            className={clsx(
              "relative block rounded-r-md border px-3 py-1 text-xl text-slate-500 dark:border-slate-500"
            )}
            onClick={() => onPageChange(Number(next))}
            disabled={Number(totalPages) === Number(currentPage)}
          >
            <span aria-hidden="true">»</span>
            <span className="sr-only">Next</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
