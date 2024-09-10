import tailwindClasses from "../../../data";

export const LinkNavbar = () => {
  return (
    <div className=" relative w-full h-full bg-red-200">
      <ul className=" sticky  top-0 right-[10%] p-0 w-full h-auto bg-red-400">
        {Object.keys(tailwindClasses).map((item, index) => {
          return <li key={index + " list" + item}>{item}</li>;
        })}
      </ul>
    </div>
  );
};
