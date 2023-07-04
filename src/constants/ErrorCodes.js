const errorCodes = {
  '6700': 'Wrong or inconsistent APDU length.',
  '6985': 'Wrapped chained command or multiple pass command ongoing.',
  '6a82': 'Application or file not found, currently selected application remains selected.',
  '6a86': 'Wrong parameter P1 and/or P2',
  '6a87': 'Wrong parameter Lc inconsistent with P1-P2',
  '6e00': 'Wrong CLA',
  '6581': 'Memory failure',
  '6982': 'Security status not satisfied',
  '91ca': 'COMMAND_ABORTED',
  '917e': 'LENGTH_ERROR',
  '919e': 'PARAMETER_ERROR',
  '9140': 'NO_SUCH_KEY',
  '919d': 'PERMISSION_DENIED',
  '91ad': 'AUTHENTICATION_DELAY',
  '911e': 'INTEGRITY_ERROR',
  '91f0': 'FILE_NOT_FOUND',
  '91ae': 'AUTHENTICATION_ERROR',
  '91ee': 'MEMORY_ERROR',
  '91be': 'BOUNDARY_ERROR'
};

//NOTE: when new APDU command gets added make sure the error codes are added here


export const isoSelectErrorCodes = {
  '6700' : 'Wrong or inconsistent APDU length.',
  '6985' : 'Wrapped chained command or multiple pass command ongoing.',
  '6a82' : 'Application or file not found, currently selected application remains selected.',
  '6a86' : 'Wrong parameter P1 and/or P2',
  '6a87' : 'Wrong parameter Lc inconsistent with P1-P2',
  '6e00' : 'Wrong CLA',
};

export default errorCodes;