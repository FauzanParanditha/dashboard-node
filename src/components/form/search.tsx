import InputField from "@/components/form/input";
import { useForm } from "react-hook-form";
import { GrPowerReset } from "react-icons/gr";

type Values = {
  search: string;
};

const SearchForm = ({ search, setSearch, revalidate, placeholder }: any) => {
  //search
  const { register, handleSubmit, setValue } = useForm<Values>({
    mode: "onBlur",
  });
  const onSubmit = (data: Values) => {
    const { search } = data;
    setSearch(search);
    revalidate({}, true);
  };
  const Reset = () => {
    setSearch("");
    setValue("search", "");
    revalidate({}, true);
  };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="grid grid-cols-6">
          <form onSubmit={handleSubmit(onSubmit)} className="col-span-4">
            <div className="mb-4 pr-3">
              <InputField
                type="search"
                label="Search:"
                placeholder={placeholder}
                className="w-full"
                {...register("search")}
                handleClick={handleSubmit(onSubmit)}
              />
            </div>
          </form>
          {search != "" && (
            <button
              className="text-md col-span-2 mt-8 flex max-h-10 w-1/2 items-center justify-center rounded bg-red-800 py-2 font-medium text-white transition duration-150 ease-in-out hover:bg-red-900 hover:shadow-lg focus:bg-red-900 focus:shadow-lg focus:outline-none focus:ring-0 dark:bg-red-800 dark:hover:bg-red-900"
              onClick={(e) => {
                e.stopPropagation();
                Reset();
              }}
            >
              <GrPowerReset className="m-2" />
              <span className="hidden pr-2 md:inline-block">Reset</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchForm;
