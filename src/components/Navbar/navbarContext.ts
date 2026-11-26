'use client';

import * as React from 'react';

import type { NavbarSize } from './Navbar.types';

/**
 * The size of the bar a `NavbarTitle` sits in, so the title takes that
 * bar's style without being told: a line of body type in the 48px app bar,
 * the page header's title in the 72px one. `null` outside a `Navbar`.
 */
export const NavbarSizeContext = React.createContext<NavbarSize | null>(null);
