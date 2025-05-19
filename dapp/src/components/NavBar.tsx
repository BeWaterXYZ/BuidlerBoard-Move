import Image from "next/image";
import { NavItem } from "./NavItem";
import {
  MODULE_URL
} from "../lib/utils/constants";

export function NavBar() {
  return (
    <nav className="navbar py-4 px-4 bg-base-100">
      <div className="flex-1 flex items-center gap-4">
        <a href="http://home.scaffold.rootmud.xyz" target="_blank" rel="noreferrer">
          <Image src="/logo.png" width={64} height={64} alt="logo" />
        </a>
        <ul className="menu menu-horizontal flex items-center gap-2">
          
          {/* <NavItem href="/example_ui" title="UI" /> | */}
          <NavItem href="/" title="Home" className="font-sans font-semibold text-base" /> |
          <NavItem href="/hackathon-manager" title="Hackathon Manager" className="font-sans font-semibold text-base" /> | 
          <li className="font-sans font-semibold text-base flex gap-2">
            <a href="https://youtu.be/1yXJgPMLiWw" target="_blank" rel="noreferrer">🎥 Video</a> |
            <a href="https://drive.google.com/file/d/1GZDbdefXtveXMbsTflgztjnom7XqX_jM/view?usp=sharing" target="_blank" rel="noreferrer">📚 Deck</a> |
            <a href="https://explorer.aptoslabs.com/account/0x9e0d5b6616485c40ce93f66e586a73cc433b63d36769554c36a57208b4aa440f/modules/code/buidlerboard/add_project?network=testnet" target="_blank" rel="noreferrer">📜 Smart Contract</a> | 
            <a href="https://github.com/BeWaterXYZ/BuidlerBoard-Move" target="_blank" rel="noreferrer">💻 Source Code</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
