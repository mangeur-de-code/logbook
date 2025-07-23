import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import FlightLog from "./FlightLog";

import Organizations from "./Organizations";

import Profile from "./Profile";

import Reports from "./Reports";

import UploadFlights from "./UploadFlights";

import Instructions from "./Instructions";

import Aircraft from "./Aircraft";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    FlightLog: FlightLog,
    
    Organizations: Organizations,
    
    Profile: Profile,
    
    Reports: Reports,
    
    UploadFlights: UploadFlights,
    
    Instructions: Instructions,
    
    Aircraft: Aircraft,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/FlightLog" element={<FlightLog />} />
                
                <Route path="/Organizations" element={<Organizations />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/UploadFlights" element={<UploadFlights />} />
                
                <Route path="/Instructions" element={<Instructions />} />
                
                <Route path="/Aircraft" element={<Aircraft />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}