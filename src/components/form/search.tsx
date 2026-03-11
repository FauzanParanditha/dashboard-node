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
    <div className="flex w-full flex-wrap items-end gap-3">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-[240px] flex-1">
        <InputField
          type="search"
          label="Search:"
          placeholder={placeholder}
          className="w-full"
          {...register("search")}
          handleClick={handleSubmit(onSubmit)}
        />
      </form>
      {search != "" && (
        <button
          className="inline-flex h-10 items-center justify-center rounded bg-red-800 px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out hover:bg-red-900 hover:shadow-lg focus:bg-red-900 focus:shadow-lg focus:outline-none focus:ring-0 dark:bg-red-800 dark:hover:bg-red-900"
          onClick={(e) => {
            e.stopPropagation();
            Reset();
          }}
        >
          <GrPowerReset className="mr-2" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

export default SearchForm;
