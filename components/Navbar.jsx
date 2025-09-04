/* eslint-disable import/no-cycle */
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

import { NFTContext } from "../context/NFTContext";
import images from "../assets";
import { Button } from ".";
import WalletConnect from "./web3/WalletConnect";
import Web3Status from "./web3/Web3Status";

const MenuItems = ({ isMobile, active, setActive, setIsOpen }) => {
  const generateLink = (i) => {
    switch (i) {
      case 0:
        return "/";
      case 1:
        return "/listed-nfts";
      case 2:
        return "/my-nfts";
      default:
        return "/";
    }
  };

  return (
    <ul
      className={`list-none flexCenter flex-row ${
        isMobile && "flex-col h-full"
      }`}
    >
      {["Explore NFTs", "Listed NFTs", "My NFTs"].map((item, i) => (
        <li
          key={i}
          onClick={() => {
            setActive(item);

            if (isMobile) setIsOpen(false);
          }}
          className={`flex flex-row items-center font-poppins font-semibold text-base dark:hover:text-white hover:text-nft-dark mx-3 ${
            active === item
              ? "dark:text-white text-nft-black-1"
              : "dark:text-nft-gray-3 text-nft-gray-2"
          }
          `}
        >
          <Link href={generateLink(i)}>{item}</Link>
        </li>
      ))}
    </ul>
  );
};

const ButtonGroup = ({ setActive, router, setIsOpen }) => {
  const { currentAccount } = useContext(NFTContext);

  return (
    <div className="flex items-center">
      <Web3Status />
      {currentAccount ? (
        <Button
          btnName="Create"
          classStyles="mx-2 rounded-xl"
          handleClick={() => {
            setActive("");
            setIsOpen(false);
            router.push("/create-nft");
          }}
        />
      ) : (
        <WalletConnect />
      )}
    </div>
  );
};

const checkActive = (active, setActive, router) => {
  switch (router.pathname) {
    case "/":
      if (active !== "Explore NFTs") setActive("Explore NFTs");
      break;
    case "/listed-nfts":
      if (active !== "Listed NFTs") setActive("Listed NFTs");
      break;
    case "/my-nfts":
      if (active !== "My NFTs") setActive("My NFTs");
      break;
    case "/create-nft":
      setActive("");
      break;
    default:
      setActive("");
  }
};

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [active, setActive] = useState("Explore NFTs");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTheme("dark");
  }, []);

  useEffect(() => {
    checkActive(active, setActive, router);
  }, [router.pathname]);

  return (
    <nav className="fixed z-10 flex-row p-4 w-full bg-white border-b flexBetween dark:bg-nft-dark dark:border-nft-black-1 border-nft-gray-1">
      <div className="flex flex-row flex-1 justify-start">
        <Link href="/">
          <div
            className="cursor-pointer flexCenter md:hidden"
            onClick={() => {
              setActive("Explore NFTs");
            }}
          >
            <Image
              src={images.logo02}
              objectFit="contain"
              width={32}
              height={32}
              alt="logo"
            />
            <p className="ml-1 text-lg font-semibold dark:text-white text-nft-black-1">
              CryptoKet
            </p>
          </div>
        </Link>
        <Link href="/">
          <div
            className="hidden md:flex"
            onClick={() => {
              setActive("Explore NFTs");
              setIsOpen(false);
            }}
          >
            <Image
              src={images.logo02}
              objectFit="contain"
              width={32}
              height={32}
              alt="logo"
            />
          </div>
        </Link>
      </div>

      <div className="flex flex-row flex-initial justify-end">
        <div className="flex items-center mr-2">
          <input
            type="checkbox"
            className="checkbox"
            id="checkbox"
            onChange={() => setTheme(theme === "light" ? "dark" : "light")}
          />
          <label
            htmlFor="checkbox"
            className="relative p-1 w-8 h-4 bg-black rounded-2xl flexBetween label"
          >
            <i className="fas fa-sun" />
            <i className="fas fa-moon" />
            <div className="absolute w-3 h-3 bg-white rounded-full ball" />
          </label>
        </div>

        <div className="flex md:hidden">
          <MenuItems active={active} setActive={setActive} />
          <div className="ml-4">
            <ButtonGroup
              setActive={setActive}
              router={router}
              setIsOpen={setIsOpen}
            />
          </div>
        </div>
      </div>

      <div className="hidden ml-2 md:flex">
        {isOpen ? (
          <Image
            src={images.cross}
            objectFit="contain"
            width={20}
            height={20}
            alt="close"
            onClick={() => setIsOpen(false)}
            className={theme === "light" ? "filter invert" : undefined}
          />
        ) : (
          <Image
            src={images.menu}
            objectFit="contain"
            width={25}
            height={25}
            alt="menu"
            onClick={() => setIsOpen(true)}
            className={theme === "light" ? "filter invert" : undefined}
          />
        )}

        {isOpen && (
          <div className="flex fixed inset-0 z-10 flex-col justify-between bg-white top-65 dark:bg-nft-dark nav-h">
            <div className="flex-1 p-4">
              <MenuItems
                active={active}
                setActive={setActive}
                isMobile
                setIsOpen={setIsOpen}
              />
            </div>
            <div className="p-4 border-t dark:border-nft-black-1 border-nft-gray-1">
              <ButtonGroup
                setActive={setActive}
                router={router}
                setIsOpen={setIsOpen}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
