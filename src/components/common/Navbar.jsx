import React from 'react';
import { Link, matchPath } from 'react-router-dom';
import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AiOutlineShoppingCart } from "react-icons/ai";
import ProfileDropDown from '../core/Homepage/Auth/ProfileDropDown';

const Navbar = () => {

    const { token } = useSelector( (state) => state.auth );
    const { user } = useSelector( (state) => state.profile );
    const { totalItems } = useSelector( (state) => state.cart );


    const location = useLocation();
    const matchRoute = (route) => {
        return matchPath({path: route}, location.pathname);
    }

  return (
    <div className='flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700'>
        <div className='flex w-11/12 max-w-maxContent items-center justify-between'>
            {/* logo image */}
            <Link to="/">
                <img src={logo} width={160} height={32} loading='lazy' alt='logo.png' />
            </Link>

            {/* NavLinks */}
            <nav>
                <ul className='flex gap-x-6 text-richblack-25'>
                    {
                        NavbarLinks.map( (link, index) => (
                            <li key={index}>
                                {
                                    link.title === "Catalog" ? (
                                        <div>
                                            {/*  */}
                                        </div>
                                    ) : (
                                        <Link to={link?.path}>
                                            <p className={`${ matchRoute(link?.path) ? "text-yellow-25": "text-richblack-25" }`}>
                                                {link.title}
                                            </p>
                                        </Link>
                                    ) 
                                }
                            </li>
                        ) )
                    }
                </ul>
            </nav>

            {/* login, signup, dashboard */}
            <div className='flex gap-x-4 items-center'>
                {/* cart button */}
                {
                    user && user?.accountType !== "Instructor" && (
                        <Link to="/dashboard/cart" 
                        className='relative'>
                            <AiOutlineShoppingCart />
                            {
                                totalItems > 0 && (
                                    <span>
                                        {totalItems}
                                    </span>
                                )
                            }
                        </Link>
                    )
                }
                {/* login button */}
                {
                    token === null && (
                        <Link to="/login">
                            <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] 
                                text-richblack-100'>
                                Log in
                            </button>
                        </Link>
                    )
                }
                {/* signup button */}
                {
                    token === null && (
                        <Link to="/signup">
                            <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] 
                                text-richblack-100'>
                                Signup
                            </button>
                        </Link>
                    )
                }
                {/* when user is logged in */}
                {
                    token !== null && (<ProfileDropDown />)
                }
                

            </div>

        </div>
    </div>
  )
}

export default Navbar