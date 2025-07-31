import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useNotification from '../../../../../../components/snackbars/SnackBar';

const UpdateCoreValues = ({ onSelectCoreValues }) => {
  const userData = JSON.parse(localStorage.getItem('dexkorUserData'));
  const [selectedValues, setSelectedValues] = useState([]);
  const [conf, setConf] = useNotification();
  const [colorChoice, setColorChoice] = useState('#FFD966');
  const [customColor, setCustomColor] = useState('#000000');
  const [allCoreValues, setAllCoreValues] = useState([]);
  const [coreValueResponses, setCoreValueResponses] = useState([]);
  const [coreValueRemoveResponse, setCoreValueRemoveResponse] = useState([]);
  const [coreValuesByUniquePartnerId, setCoreValuesByUniquePartnerId] = useState([]);
  const [starboardSetupDetails, setStarboardSetupDetails] = useState({});
  const [newCoreValue, setNewCoreValue] = useState({ name: '', background: colorChoice, color: '' });

  const handleChange = e => {
    const { name, value } = e.target;
    setNewCoreValue(prev => ({ ...prev, [name]: value }));
  };

  const handleValueChange = value => {
    setSelectedValues(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const isPreSavedValue = name => coreValuesByUniquePartnerId.some(val => val.name === name);

  const adjustColorBrightness = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
        .toUpperCase()
    );
  };

  const getAllCoreValues = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_CONVERSATION}/starboard/get-all-core-values`);
      setAllCoreValues(response.data.data);
    } catch (error) {
      console.error('Error fetching core values:', error);
    }
  };

  const getCoreValuesByUniquePartnerId = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CONVERSATION}/starboard/getCoreValues/${userData.uniquePartnerId}`
      );
      const values = response.data.data[0].coreValues || [];
      setCoreValuesByUniquePartnerId(values);
      const selected = values.map(val => val.name);
      setSelectedValues(selected);
    } catch (error) {
      console.error('Error fetching user core values:', error);
    }
  };

  const handleAddCoreValue = async () => {
    if (!newCoreValue.name.trim()) return;

    const backgroundColor = colorChoice === 'custom' ? customColor : colorChoice;
    const newOption = {
      name: newCoreValue.name,
      background: backgroundColor,
      color: adjustColorBrightness(backgroundColor, -0.3),
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_CONVERSATION}/starboard/add-new-core-values`, newOption);
      setCoreValueResponses(prev => [...prev, response.data]);
      setNewCoreValue({ name: '', background: '', color: '' });
      setColorChoice('#FFD966');
      setCustomColor('#000000');
    } catch (error) {
      console.error('Error adding new core value:', error);
    }
  };

  const updateCoreValuesInDatabase = async () => {
    const structuredValues = allCoreValues
      .filter(value => selectedValues.includes(value.name))
      .map(value => ({
        coreValueId: value._id,
        name: value.name,
        color: value.color,
        background: value.background,
      }));

    try {
      await axios.post(
        `${import.meta.env.VITE_CONVERSATION}/starboard/setCoreValues`,
        { coreValues: structuredValues, uniquePartnerId: userData.uniquePartnerId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setConf({ msg: 'Core Values updated successfully', variant: 'success' });
    } catch (error) {
      console.error('Error updating core values:', error);
    }
  };

  const handleDeleteCoreValueByUPI = async coreId => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_CONVERSATION}/starboard/remove-core-value/${userData.uniquePartnerId}/${coreId}`
      );
      setCoreValueRemoveResponse(prev => [...prev, response.data]);
      setConf({ msg: 'Core Value removed', variant: 'info' });
    } catch (error) {
      console.error('Error deleting core value:', error);
    }
  };

  const getStarboardSetupDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CONVERSATION}/starboard/get-starboard-setup-details/${userData.uniquePartnerId}`
      );
      setStarboardSetupDetails(response.data.starboardSetup);
    } catch (error) {
      console.error('Error fetching starboard setup:', error);
    }
  };

  useEffect(() => {
    getAllCoreValues();
    getCoreValuesByUniquePartnerId();
  }, [coreValueResponses, coreValueRemoveResponse]);

  useEffect(() => {
    if (coreValuesByUniquePartnerId.length > 0) {
      const selectedNames = coreValuesByUniquePartnerId.map(val => val.name);
      setSelectedValues(selectedNames);
    }
  }, [coreValuesByUniquePartnerId]);

  useEffect(() => {
    if (userData?.uniquePartnerId) getStarboardSetupDetails();
  }, [userData?.uniquePartnerId]);

  const isHrUser = starboardSetupDetails?.HrId?.some(hr => hr.userId === userData?.id);
  const allowAccess = userData?.role === 'Admin' || isHrUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Core Values</h1>
          <p className="text-lg text-gray-600">Select and manage your organization's core values</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Core Values Selection */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Available Core Values
                </h2>
              </div>
              
              <div className="p-6">
                {allCoreValues.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No core values available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allCoreValues.map(value => {
                      const isChecked = selectedValues.includes(value.name);
                      const isPreSaved = isPreSavedValue(value.name);

                      return (
                        <div key={value.name} className="relative group">
                          <label
                            className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                              isChecked 
                                ? 'border-blue-500 shadow-lg transform scale-105' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ 
                              backgroundColor: isChecked ? value.background : '#f8fafc',
                              color: isChecked ? value.color : '#374151'
                            }}
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                value={value.name}
                                checked={isChecked}
                                onChange={() => handleValueChange(value.name)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                                isChecked 
                                  ? 'bg-white border-white' 
                                  : 'border-gray-300'
                              }`}>
                                {isChecked && (
                                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="font-medium flex-1">{value.name}</span>
                            {isPreSaved && (
                              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                Active
                              </span>
                            )}
                          </label>

                          {isPreSaved && allowAccess && (
                            <button
                              onClick={() => handleDeleteCoreValueByUPI(value._id)}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                              title="Remove core value"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Update Button */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <button
                onClick={updateCoreValuesInDatabase}
                disabled={!allowAccess || selectedValues.length === 0}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  allowAccess && selectedValues.length > 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Update Core Values ({selectedValues.length} selected)</span>
              </button>
              
              {!allowAccess && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  You need admin or HR permissions to update core values
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Add New Core Value */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Value
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Core Value Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Innovation, Integrity, Excellence"
                    value={newCoreValue.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                  <select
                    value={colorChoice}
                    onChange={e => setColorChoice(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="#FFD966">🟡 Soft Yellow</option>
                    <option value="#FF8C69">🔴 Soft Red</option>
                    <option value="#5D9BC6">🔵 Soft Blue</option>
                    <option value="#FFB84D">🟠 Soft Orange</option>
                    <option value="#66CCCC">🔷 Soft Cyan</option>
                    <option value="#6A4C9C">🟣 Soft Indigo</option>
                    <option value="#FF66B2">🩷 Soft Pink</option>
                    <option value="#9B59B6">🟪 Soft Purple</option>
                    <option value="#B0B0B0">⚫ Soft Gray</option>
                    <option value="custom">🎨 Custom Color</option>
                  </select>
                </div>

                {colorChoice === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                )}

                {/* Color Preview */}
                <div className="p-4 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div
                    className="px-4 py-2 rounded-lg font-medium text-center"
                    style={{
                      backgroundColor: colorChoice === 'custom' ? customColor : colorChoice,
                      color: adjustColorBrightness(colorChoice === 'custom' ? customColor : colorChoice, -0.3)
                    }}
                  >
                    {newCoreValue.name || 'Sample Core Value'}
                  </div>
                </div>

                <button
                  onClick={handleAddCoreValue}
                  disabled={!allowAccess || !newCoreValue.name.trim()}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    allowAccess && newCoreValue.name.trim()
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Core Value</span>
                </button>

                {!allowAccess && (
                  <p className="text-xs text-gray-500 text-center">
                    Admin or HR permissions required
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCoreValues;