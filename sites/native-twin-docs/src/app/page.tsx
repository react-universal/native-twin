"use client";
import { ButtonVariable } from "@/components/ButtonVariable";
import Image from "next/image";
import srcTest from "../../public/test-image.jpg";
import { SearchButton } from "@/components/SearchButton";

export default function Home() {
  return (
    <div className=" relative ">
      <header className="grid grid-cols-2 gap-[20px]">
        <div>
          <h1 className=" text-[57px]">
            Rapidly build modern websites without ever leaving your HTML.
          </h1>
          <p className=" text-[24px]">
            A utility-first CSS framework packed with classes
            like flex, pt-4, text-center and rotate-90 that can be composed to
            build any design, directly in your markup.
          </p>
          <div className="flex flex-row items-center justify-center gap-5 ">
            <ButtonVariable color="#7C3AED">Get Started</ButtonVariable>
            <SearchButton></SearchButton>
          </div>
        </div>
        <picture className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
          <Image
            className="w-full h-full object-fill"
            src={srcTest}
            alt="image of native twin"
          ></Image>
        </picture>
      </header>

      <section className="py-[50px] flex flex-col items-center gap-5">
        <div className=" gap-4 flex flex-col items-center justify-center my-[20px]">
          <h2 className="flex flex-col  text-center text-[36px]">
            Trabaja en native como en web
          </h2>
          <p className=" text-center max-w-[900px]">
            I’ve written a few thousand words on why traditional “semantic class
            names” are the reason CSS is hard to maintain, but the truth is
            you’re never going to believe me until you actually try it. If you
            can suppress the urge to retch long enough to give it a chance, I
            really think you’ll wonder how you ever worked with CSS any other
            way.
          </p>{" "}
          <ButtonVariable color="#7C3AED">Get Started</ButtonVariable>
        </div>
        <div className="grid grid-cols-2 gap-[20px] ">
          <picture className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
            <Image
              className="w-full h-full object-fill"
              src={srcTest}
              alt="image of native twin"
            ></Image>
          </picture>
          <picture className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
            <Image
              className="w-full h-full object-fill"
              src={srcTest}
              alt="image of native twin"
            ></Image>
          </picture>
        </div>
      </section>
      <section className="grid grid-cols-5">
        <picture className=" col-span-3 w-full h-full bg-gray-200 rounded-lg overflow-hidden">
          <Image
            className="w-full h-full object-fill"
            src={srcTest}
            alt="image of native twin"
          ></Image>
        </picture>
        <div className=" col-span-2 flex flex-col items-center justify-center my-[20px]">
          <h2 className="flex flex-col max-w-[500px] text-center text-[36px]">
            Trabaja en native <span> como en web</span>
          </h2>{" "}
          <p className=" text-center max-w-[900px]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus
            provident nam laborum error eum doloremque deserunt, dolorum atque?
            Repellat nulla nesciunt optio voluptatem animi esse hic repellendus
            dolores laudantium minima!
          </p>
          <ButtonVariable color="#7C3AED">Get Started</ButtonVariable>
        </div>
      </section>
    </div>
  );
}
