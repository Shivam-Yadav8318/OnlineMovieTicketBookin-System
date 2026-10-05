import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold">
        <span className="text-red-500">{text1}</span>{' '}
        <span className="text-white">{text2}</span>
      </h2>

      <div className="mt-2 h-1 w-20 bg-red-500 rounded-full"></div>
    </div>
  )
}

export default Title