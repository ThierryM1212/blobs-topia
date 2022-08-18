import React, { useState } from "react"

export const Checkbox = () => {
  const [checked, setChecked] = useState(false)
  return (
    <>
      <input
      className="zonecard m-1"
        type="checkbox"
        checked={checked}
        id="checkbox"
        onChange={() => setChecked(!checked)}
      />
    </>
  )
}
