import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { getNetworkName } from '../utils/connectors';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon as MenuIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';

// ... existing code ... 