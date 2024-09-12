import Image from "next/image";

export const Navbar = () => {
  return (
    <header className="z-50 w-full flex flex-row justify-around  absolute text-white bg-[rgba(0,0,0,0.4)] backdrop-blur-lg">
      <div className="w-full flex flex-row max-w-[1400px] p-5 m-auto">
        <div className="w-full flex flex-row gap-5 items-center">
          <picture className="w-5 h-5 bg-white flex ">
            <Image src={""} alt=""></Image>
          </picture>
          <h3>  Native-Twin </h3>
        </div> 
        <nav className="w-full ">
          <ul className="flex flex-row gap-4 justify-end">
            <li>Docs</li>
            <li>Components</li>
            <li>Github button</li>
            {/* <li>Theme button</li> preguntar chrispio */}
          </ul>
        </nav>
      </div>
    </header>
  );
};
