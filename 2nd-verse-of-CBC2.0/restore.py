import glob

boilerplate = """import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Code2, ShieldAlert, Cpu, Network, Zap, Download, Lock, Unlock, Mail, Phone, Instagram, Link as LinkIcon, User, Trophy, Crown, Medal, Award, Sparkles, CheckCircle2, Briefcase, Menu, X } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { PROBLEM_STATEMENTS_CONFIG } from '../config/problemStatements';

// ------------------------------------------------------------------
// GLOBAL CONSTANTS & DESIGN TOKENS
// ------------------------------------------------------------------
const BUTTERY_EASE = [0.22, 1, 0.36, 1];
"""

files = glob.glob('src/components/*.jsx') + glob.glob('src/components/*.js')
ignore_files = ['NavigationBar.jsx', 'RulesSection.jsx', 'HeroSection.jsx', 'AdminPortal.jsx']

for file in files:
    if any(i in file for i in ignore_files): continue
    
    with open(file, 'r') as f:
        content = f.read()
    
    if "import" not in content[:50]:
        with open(file, 'w') as f:
            f.write(boilerplate + "\n" + content)
        print(f"Restored {file}")

