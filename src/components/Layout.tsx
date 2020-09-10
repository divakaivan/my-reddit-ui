import React from "react";
import {Wrapper, WrapperVariant} from "./Wrapper";
import {NavBar} from "./NavBar";

interface WrapperProps {
    variant?: WrapperVariant
}

const Layout: React.FC<WrapperProps> = ({children, variant = "regular"}) => {
    return (
        <>
            <NavBar/>
            <Wrapper variant={variant}>
                {children}
            </Wrapper>
        </>
    )
};

export default Layout;