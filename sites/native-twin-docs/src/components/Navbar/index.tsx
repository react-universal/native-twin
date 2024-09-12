import Image from "next/image";
import Link from "next/link";
import { IoLogoGithub } from "react-icons/io5";

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
          <ul className="flex flex-row gap-4 items-center justify-end">
            <li><Link href={"/"}>Home</Link></li>
            <li ><Link href={'/docs'}>Docs</Link></li>
            
            <li><Link  href={"https://github.com/react-universal/native-twin"}><IoLogoGithub  className="w-5 h-5 object-contain"/></Link></li>
            {/* <li>Theme button</li> preguntar chrispio */}
          </ul>
        </nav>
      </div>
    </header>
  );
};
