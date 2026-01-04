"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const ResourceContext = createContext();

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export function ResourceProvider({ children }) {
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchResources = async () => {
        try {
            const res = await fetch(`${API_URL}/resources`);
            if (res.ok) {
                const data = await res.json();
                setResources(data);

                // Load saved selection or default to first
                const savedId = localStorage.getItem('ot_resource_id');
                if (savedId) {
                    const found = data.find(r => r.id.toString() === savedId);
                    if (found) {
                        setSelectedResource(found);
                    } else if (data.length > 0) {
                        setSelectedResource(data[0]);
                    }
                } else if (data.length > 0) {
                    setSelectedResource(data[0]);
                }
            }
        } catch (err) {
            console.error("Failed to load resources:", err);
        } finally {
            setLoading(false);
        }
    };

    const selectResource = (resourceId) => {
        const resource = resources.find(r => r.id.toString() === resourceId.toString());
        if (resource) {
            setSelectedResource(resource);
            localStorage.setItem('ot_resource_id', resource.id);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    return (
        <ResourceContext.Provider value={{ resources, selectedResource, selectResource, loading, fetchResources }}>
            {children}
        </ResourceContext.Provider>
    );
}

export const useResource = () => useContext(ResourceContext);
