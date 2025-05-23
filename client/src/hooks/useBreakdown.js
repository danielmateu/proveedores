'use client'

import { useState } from "react"

const sampleEquipment = [
    { reference: "16310", description: "TERMO NCDEP TERMOVENTILADOR ELECTRICO 1500W", quantity: 0 },
    { reference: "16311", description: "TERMO NCDEP TERMOVENTILADOR ELECTRICO 2000W", quantity: 0 },
    { reference: "16727", description: "HORNO NCDEP TERMO", quantity: 0 },
    { reference: "17414", description: "CALENTADOR DE AGUA TERMOSTATICO BOSCH TS6001312D31", quantity: 0 },
]

export default function useBreakdown() {

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedEquipment, setSelectedEquipment] = useState([])
    const [equipmentType, setEquipmentType] = useState("")
    const [equipmentList, setEquipmentList] = useState(sampleEquipment)

    const filteredEquipment = equipmentList.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const updateQuantity = (reference, increment) => {
        setEquipmentList(prevList =>
            prevList.map(item =>
                item.reference === reference
                    ? { ...item, quantity: Math.max(0, item.quantity + increment) }
                    : item
            )
        )
    }

    const addEquipment = (equipment) => {
        if (equipment.quantity > 0) {
            const existingIndex = selectedEquipment.findIndex(item => item.reference === equipment.reference)
            if (existingIndex >= 0) {
                setSelectedEquipment(prevSelected =>
                    prevSelected.map((item, index) =>
                        index === existingIndex
                            ? { ...item, quantity: item.quantity + equipment.quantity }
                            : item
                    )
                )
            } else {
                setSelectedEquipment(prevSelected => [...prevSelected, { ...equipment }])
            }
            updateQuantity(equipment.reference, -equipment.quantity)
        }
    }

    const updateSelectedQuantity = (reference, increment) => {
        setSelectedEquipment(prevSelected =>
            prevSelected.map(item =>
                item.reference === reference
                    ? { ...item, quantity: Math.max(0, item.quantity + increment) }
                    : item
            ).filter(item => item.quantity > 0)
        )
    }

    const removeSelectedEquipment = (reference) => {
        setSelectedEquipment(prevSelected =>
            prevSelected.filter(item => item.reference !== reference)
        )
    }
    return {
        searchTerm,
        setSearchTerm,
        selectedEquipment,
        setSelectedEquipment,
        equipmentType,
        setEquipmentType,
        equipmentList,
        setEquipmentList,
        filteredEquipment,
        updateQuantity,
        addEquipment,
        updateSelectedQuantity,
        removeSelectedEquipment
    }
}