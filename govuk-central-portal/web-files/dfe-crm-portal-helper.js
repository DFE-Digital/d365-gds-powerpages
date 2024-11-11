var DfEPortal = DfEPortal || {};  // if variable is not defined then set it to an empty object, otherwise do nothing.

DfEPortal = {

  ValidateData: async function (inputsToValidate) {
    try {
      DfEPortal.Errors.HideErrorSummary();
      const results = await Promise.all(inputsToValidate.map(inputObj => this.CheckInput(inputObj)));
      if (results.every(result => result.resolve === true)) {
        DfEPortal.Errors.HideErrorSummary();
        return Promise.resolve();
      } else {
        DfEPortal.Errors.FocusErrorSummary();
        return Promise.reject();
      }
    } catch (error) {
      console.error(error);
      DfEPortal.Errors.ShowErrorSummary();
      DfEPortal.Errors.AddErrorSummaryDetail(inputObj.identifier, "Internal error. Please contact the DfE.");
      return Promise.reject();
    }
  },

  CheckInput: async function (inputObj) {
    try {
      const successObj = await this.RunValidation(inputObj);
      inputObj.resolve = true;
      DfEPortal.Errors.ClearInputError(successObj.identifier, inputObj.type);
      DfEPortal.Errors.RemoveErrorSummaryDetail(successObj.identifier);
      return inputObj;
    } catch (errorObj) {
      inputObj.resolve = false;
      DfEPortal.Errors.ShowInputError(errorObj.identifier, inputObj.type, errorObj.errorMessage);
      DfEPortal.Errors.ShowErrorSummary();
      DfEPortal.Errors.AddErrorSummaryDetail(errorObj.identifier, errorObj.errorMessage);
      return inputObj;
    }
  },

  RunValidation: async function (inputObj) {
    const identifierValidObj = this.ValidationHelper.IsIdentifierValid(inputObj.identifier, inputObj.type);

    if (!identifierValidObj.value) {
      DfEPortal.Errors.ShowErrorSummary();
      DfEPortal.Errors.AddErrorSummaryDetail(inputObj.identifier, "Internal error. Please contact the DfE.");
      return Promise.reject(identifierValidObj);
    }

    const nullCheckObj = this.ValidationHelper.NullCheck(inputObj.identifier, inputObj.type, inputObj.friendlyName, inputObj.required);
    if (!nullCheckObj.value) {
      return Promise.reject(nullCheckObj);
    }
    
    if (inputObj.type === 'number') {
      return this.ValidateNumber(inputObj);
    }
    if (inputObj.type === 'whole-number') {
      return this.ValidateWholeNumber(inputObj);
    }
    if (inputObj.type === 'decimal-number') {
      return this.ValidateDecimalNumber(inputObj);
    }
    if (inputObj.type === 'text') {
      return this.ValidateText(inputObj);
    }
    if (inputObj.type === 'text-area') {
      return this.ValidateTextArea(inputObj);
    }
    if (inputObj.type === 'email') {
      return this.ValidateEmail(inputObj);
    }
    if (inputObj.type === 'tel') {
      return this.ValidateTelephone(inputObj);
    }
    if (inputObj.type === 'radio' || inputObj.type === 'checkbox' || inputObj.type === 'select') {
      return Promise.resolve(inputObj);
    }
    if (inputObj.type === "date") {
      return this.ValidateDate(inputObj);
    }
    if (inputObj.type === 'file') {
      return this.ValidateFile(inputObj);
    }
  },

  ValidateNumber: async function (inputObj) {
    const identifier = inputObj.identifier;
    const friendlyName = inputObj.friendlyName;

    if (inputObj.required) {
      // Validate if it's a number
      const isNumberObj = DfEPortal.ValidationHelper.IsNumber(identifier, friendlyName);
      if (!isNumberObj.value) {
        return Promise.reject(isNumberObj);
      }

      // Perform MinMaxValueChecks
      const minMaxValueCheckObj = DfEPortal.ValidationHelper.MinMaxValueChecks(identifier, friendlyName);
      if (!minMaxValueCheckObj.value) {
        return Promise.reject(minMaxValueCheckObj);
      }
    }

    // If it reaches this point, the number input is valid
    return Promise.resolve(inputObj);
  },

  ValidateWholeNumber: async function (inputObj) {
    const identifier = inputObj.identifier;
    const friendlyName = inputObj.friendlyName;
    const description = inputObj.description != undefined ? inputObj.description : "";

    // Validate if it's a number
    const isNumberObj = DfEPortal.ValidationHelper.IsNumber(identifier, friendlyName);
    if (!isNumberObj.value) {
      return Promise.reject(isNumberObj);
    }

    // Validate if it's a whole number
    const isWholeNumberObj = DfEPortal.ValidationHelper.IsWholeNumber(identifier, friendlyName);
    if (!isWholeNumberObj.value) {
      return Promise.reject(isWholeNumberObj);
    }

    // Perform MinMaxCharacterChecks
    const minMaxCharacterCheckObj = DfEPortal.ValidationHelper.MinMaxCharacterChecks(identifier, friendlyName, description);
    if (!minMaxCharacterCheckObj.value) {
      return Promise.reject(minMaxCharacterCheckObj);
    }

    // Perform MinMaxValueChecks
    const minMaxValueCheckObj = DfEPortal.ValidationHelper.MinMaxValueChecks(identifier, friendlyName, description);
    if (!minMaxValueCheckObj.value) {
      return Promise.reject(minMaxValueCheckObj);
    }


    // If it reaches this point, the whole number input is valid
    return Promise.resolve(inputObj);
  },

  ValidateDecimalNumber: async function (inputObj) {
    const identifier = inputObj.identifier;
    const friendlyName = inputObj.friendlyName;
    const description = inputObj.description != undefined ? inputObj.description : "";


    // Validate if it's a number
    const isNumberObj = DfEPortal.ValidationHelper.IsNumber(identifier, friendlyName);
    if (!isNumberObj.value) {
      return Promise.reject(isNumberObj);
    }

    // Validate if it's a decimal number
    const isDecimalNumberObj = DfEPortal.ValidationHelper.IsDecimalNumber(identifier, friendlyName);
    if (!isDecimalNumberObj.value) {
      return Promise.reject(isDecimalNumberObj);
    }

    // Perform MinMaxValueChecks
    const minMaxValueCheckObj = DfEPortal.ValidationHelper.MinMaxValueChecks(identifier, friendlyName, description);
    if (!minMaxValueCheckObj.value) {
      return Promise.reject(minMaxValueCheckObj);
    }


    // If it reaches this point, the decimal number input is valid
    return Promise.resolve(inputObj);
  },

  ValidateText: async function (inputObj) {
    const identifier = inputObj.identifier;
    const targetType = inputObj.targetType;
    const friendlyName = inputObj.friendlyName;
    const targetEntity = inputObj.targetEntity;
    const targetEntitySearchField = inputObj.targetEntitySearchField;
    const targetEntityPrimaryKey = inputObj.targetEntityPrimaryKey;
    const description = inputObj.description != undefined ? inputObj.description : "";

    // If it's a lookup text input, perform TextInputSearchValidation
    if (targetType === 'lookup') {
      const searchValidationObj = await DfEPortal.ValidationHelper.TextInputSearchValidation(identifier, targetEntity, targetEntitySearchField, targetEntityPrimaryKey, friendlyName);
      if (!searchValidationObj.value) {
        return Promise.reject(searchValidationObj);
      }
      // Assign the target entity ID to the inputObj
      inputObj.targetEntityId = searchValidationObj.targetEntityId;
    }

    // Perform MinMaxCharacterChecks
    const minMaxCharacterCheckObj = DfEPortal.ValidationHelper.MinMaxCharacterChecks(identifier, friendlyName, description);
    if (!minMaxCharacterCheckObj.value) {
      return Promise.reject(minMaxCharacterCheckObj);
    }

    // If it reaches this point, the text input is valid
    return Promise.resolve(inputObj);
  },

  ValidateTextArea: async function (inputObj) {
    const identifier = inputObj.identifier;
    const friendlyName = inputObj.friendlyName;
    const description = inputObj.description != undefined ? inputObj.description : "";

    // Validate character count container
    const characterCountCheckObj = DfEPortal.ValidationHelper.CharacterCountContainerCheck(identifier, friendlyName);
    if (!characterCountCheckObj.value) {
      return Promise.reject(characterCountCheckObj);
    }

    // Validate word count container
    const wordCountCheckObj = DfEPortal.ValidationHelper.WordCountContainerCheck(identifier, friendlyName);
    if (!wordCountCheckObj.value) {
      return Promise.reject(wordCountCheckObj);
    }

    // Perform MinMaxCharacterChecks
    const minMaxCharacterCheckObj = DfEPortal.ValidationHelper.MinMaxCharacterChecks(identifier, friendlyName, description);
    if (!minMaxCharacterCheckObj.value) {
      return Promise.reject(minMaxCharacterCheckObj);
    }

    // If it reaches this point, the text area input is valid
    return Promise.resolve(inputObj);
  },

  ValidateEmail: async function (inputObj) {
    const identifier = inputObj.identifier;
    const friendlyName = inputObj.friendlyName;
    const description = inputObj.description != undefined ? inputObj.description : "";

    // Validate email format
    const isEmailObj = DfEPortal.ValidationHelper.IsEmail(identifier);
    if (!isEmailObj.value) {
      return Promise.reject(isEmailObj);
    }

    // Perform MinMaxCharacterChecks
    const minMaxCharacterCheckObj = DfEPortal.ValidationHelper.MinMaxCharacterChecks(identifier, friendlyName, description);
    if (!minMaxCharacterCheckObj.value) {
      return Promise.reject(minMaxCharacterCheckObj);
    }

    // If it reaches this point, the email input is valid
    return Promise.resolve(inputObj);
  },

  ValidateTelephone: async function (inputObj) {
    const identifier = inputObj.identifier;

    // Validate telephone format
    const isTelephoneObj = DfEPortal.ValidationHelper.IsTelephone(identifier);
    if (!isTelephoneObj.value) {
      return Promise.reject(isTelephoneObj);
    }

    // If it reaches this point, the telephone input is valid
    return Promise.resolve(inputObj);
  },

  ValidateOption: async function (inputObj) {
    // No addition functions other than NullCheck at this stage
    // The option input is valid
    //return Promise.resolve(inputObj);
  },

  ValidateDate: async function (inputObj) {
    const identifier = inputObj.identifier;
    const friendlyName = inputObj.friendlyName;

    // Validate date format
    const dateInputsObj = DfEPortal.ValidationHelper.ValidateDateInputs(identifier, friendlyName);
    if (!dateInputsObj.value) {
      return Promise.reject(dateInputsObj);
    }

    // Validate if the date is valid
    const isDateValidObj = DfEPortal.ValidationHelper.IsDateValid(identifier, friendlyName);
    if (!isDateValidObj.value) {
      return Promise.reject(isDateValidObj);
    }

    // If it reaches this point, the date input is valid
    return Promise.resolve(inputObj);
  },

  ValidateFile: async function (inputObj) {
    const identifier = inputObj.identifier;
    const friendlyName = inputObj.friendlyName;
    const maxFileSize = inputObj.maxFileSize;
    const maxLimit = inputObj.fileLimit;
    const flowId = inputObj.virusCheckFlowId;
    const allowedExtensions = inputObj.allowedExtensions;

    // Check valid file extensions
    const fileExtensionObj = DfEPortal.ValidationHelper.ValidFileExtensionCheck(identifier, allowedExtensions);
    if (!fileExtensionObj.value) {
      return Promise.reject(fileExtensionObj);
    }

    // Check max file attachment limit
    const fileLimitObj = DfEPortal.ValidationHelper.FileLimitCheck(identifier, maxLimit);
    if (!fileLimitObj.value) {
      return Promise.reject(fileLimitObj);
    }

    // Check file size
    const fileSizeObj = DfEPortal.ValidationHelper.FileSizeCheck(identifier, friendlyName, maxFileSize);
    if (!fileSizeObj.value) {
      return Promise.reject(fileSizeObj);
    }

    // Perform virus check
    const virusScanObj = await DfEPortal.ValidationHelper.VirusCheck(identifier, flowId);
    if (!virusScanObj.value) {
      return Promise.reject(virusScanObj);
    }

    // If it reaches this point, the file(s) are valid
    return Promise.resolve(inputObj);
  },

  GetFileContent: function(input) {
    return new Promise((resolve, reject) => {
      const $fileInput = $(`#${input}`);
      const files = $fileInput[0].files;
        
      if (!files.length) {
        const errorObj = {
          identifier: input,
          errorMessage: "There has been an unexpected error processing your files. No files have been found. Please contact the DfE."
        };
        DfEPortal.Errors.ShowInputError(errorObj.identifier, "file", errorObj.errorMessage);
        DfEPortal.Errors.ShowErrorSummary();
        DfEPortal.Errors.AddErrorSummaryDetail(errorObj.identifier, errorObj.errorMessage);
        reject();
        return;
      }

      const fileDetailsPromises = Array.from(files).map(file => {
        return new Promise((fileResolve, fileReject) => {
          const fileName = file.name;
          const mimeType = file.type;
          const fileSize = file.size;
          const filenameExtension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);

          const reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = function(e) {
            const documentbodyContents = e.target.result;
            const base64Content = documentbodyContents.substring(documentbodyContents.indexOf(',') + 1);
            fileResolve({
                fileName: fileName,
                mimeType: mimeType,
                fileSize: fileSize,
                fileExtension: filenameExtension,
                fileContent: base64Content
            });
          };

          reader.onerror = function() {
            const errorObj = {
              identifier: input,
              errorMessage: `There has been an unexpected error reading your file "${fileName}". Please try again.`
              };
              fileReject(errorObj);
          };
        });
      });

      Promise.all(fileDetailsPromises)
      .then(fileDetails => {
          resolve(fileDetails);
      })
      .catch(error => {
          reject(error);
      });
    });
  },

  DisableButton: function (btnId) {
    $(`#${btnId}`).addClass("govuk-button--disabled");
    $(`#${btnId}`).attr("disabled", "disabled");
  },

  EnableButton: function (btnId) {
    $(`#${btnId}`).removeClass("govuk-button--disabled");
    $(`#${btnId}`).removeAttr("disabled");
  },

  ShowLoadingSpinner: function (loaderId) {
    $(`#${loaderId}`).removeClass('govuk-visually-hidden');
  },

  HideLoadingSpinner: function (loaderId) {
    $(`#${loaderId}`).addClass('govuk-visually-hidden');
  }
}

DfEPortal.ValidationHelper = {

  InputTypes: {
    Radio: "radio",
    Checkbox: "checkbox",
    Date: "date",
    Select: "select",
    Text: "text",
    FileColumn: "file"
  },

  IsIdentifierValid: function (input, type) {
    const selector = type === this.InputTypes.Radio || type === this.InputTypes.Checkbox
      ? `input[name='${input}']`
      : `#${input}`;

    const elements = $(selector);
    const exists = elements.length > 0;
    const errorMessage = exists ? null : `'${input}' identifier cannot be found`;

    return { identifier: input, value: exists, errorMessage };
  },

  NullCheck: function (input, type, friendlyName, required) {
    try {
      if (!required) {
        return { identifier: input, value: true, errorMessage: null };
      }

      const $input = $(`#${input}`);
      const inputName = `input[name='${input}']`;

      if (type === this.InputTypes.Radio || type === this.InputTypes.Checkbox) {
        const checked = $(inputName).is(':checked');
        return {
          identifier: input,
          value: checked,
          errorMessage: checked ? null : `Select ${friendlyName}`
        };
      } else if (type === this.InputTypes.Select) {
        const selectedValue = $input.find('option:selected').val();
        return {
          identifier: input,
          value: selectedValue !== "",
          errorMessage: selectedValue !== "" ? null : `Choose ${friendlyName}`
        };
      } else if (type === this.InputTypes.Date) {
        let dateObj = { day: "", month: "", year: "" };
        const inputs = $(`input[name="${input}"]`);
        inputs.each(function () {
          const id = $(this).attr('id');
          if (id.includes('-day')) {
            dateObj.day = $(this).val();
          } else if (id.includes('-month')) {
            dateObj.month = $(this).val();
          } else if (id.includes('-year')) {
            dateObj.year = $(this).val();
          }
        });

        const allNullValues = Object.values(dateObj).every(val => val === "");

        if (allNullValues) {
          const messageStr = `Enter ${friendlyName}`;
          return {
            identifier: input,
            value: false,
            errorMessage: messageStr
          };
        }

        const missingValues = [];
        if (dateObj.day === "") {
          missingValues.push("day");
        }
        if (dateObj.month === "") {
          missingValues.push("month");
        }
        if (dateObj.year === "") {
          missingValues.push("year");
        }

        if (missingValues.length > 0) {
          const missingFields = missingValues.join(" and ");
          const messageStr = `${this.ToProperCase(friendlyName)} must contain a ${missingFields}`;
          return {
            identifier: input,
            value: false,
            errorMessage: messageStr
          };
        }

        return {
          identifier: input,
          value: true,
          errorMessage: null
        };
      } else if (type === this.InputTypes.FileColumn) {
        const fileLength = $input[0].files.length;
        return {
          identifier: input,
          value: fileLength > 0 ? true : false,
          errorMessage: fileLength > 0 ? null : `Select a file`
        }
      } else if (this.IsWhiteSpace($input.val()) === true) {
        return {
          identifier: input,
          value: this.IsWhiteSpace($input.val()) === false ? true : false,
          errorMessage: `Enter ${friendlyName}`
        }
      } else {
        const inputValue = $input.val();
        return {
          identifier: input,
          value: inputValue || !isWhiteSpace ? true : false,
          errorMessage: inputValue || !isWhiteSpace ? null : `Enter ${friendlyName}`
        };
      }
    }
    catch(error) {
      console.log(error);
      return {
        identifier: input,
        value: false,
        errorMessage: `An unexpected error has occured. Please try again. If the problem continues contact the DfE.`
      };
    }
  },

  IsWhiteSpace: function (input) {
    return /^\s*$/.test(input);
  },

  ValidateDateInputs: function (input, friendlyName) {
    let dateObj = { day: "", month: "", year: "" };
    const inputs = $(`input[name="${input}"]`);

    inputs.each(function () {
      const id = $(this).attr('id');
      if (id.includes('-day')) {
        dateObj.day = $(this).val();
      } else if (id.includes('-month')) {
        dateObj.month = $(this).val();
      } else if (id.includes('-year')) {
        dateObj.year = $(this).val();
      }
    });

    // Check if all inputs are empty
    const allInputsEmpty = Object.values(dateObj).every(val => val === "");

    if (allInputsEmpty) {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      };
    }

    const invalidDates = [];

    for (const [key, value] of Object.entries(dateObj)) {
      const int = parseInt(value);
      const isNumber = !isNaN(int);

      if (key === "day") {
        if (!isNumber || int < 1 || int > 31) {
          invalidDates.push(key);
        }
      } else if (key === "month") {
        if (!isNumber || int < 1 || int > 12) {
          invalidDates.push(key);
        }
      } else if (key === "year") {
        if (!isNumber || value.length !== 4) {
          invalidDates.push(key);
        }
      }
    }

    if (invalidDates.length > 0) {
      const invalidDateStr = invalidDates.map(key => `${key}`).join(' and ');
      const messageStr = `${this.ToProperCase(friendlyName)} must contain a valid ${invalidDateStr}`;

      return {
        identifier: input,
        value: false,
        errorMessage: messageStr
      };
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      };
    }
  },

  IsDateValid: function (input, friendlyName) {
    let dateObj = { day: "", month: "", year: "" };
    const inputs = $(`input[name="${input}"]`);

    inputs.each(function () {
      const id = $(this).attr('id');
      if (id.includes('-day')) {
        dateObj.day = $(this).val();
      } else if (id.includes('-month')) {
        dateObj.month = $(this).val();
      } else if (id.includes('-year')) {
        dateObj.year = $(this).val();
      }
    });

    const dateValues = Object.values(dateObj).filter(value => value !== "");

    if (dateValues.length > 0) {
      const dateObjCount = Object.keys(dateObj).length;

      if (dateObjCount === 3) {
        const year = parseInt(dateObj.year);
        const month = parseInt(dateObj.month);
        const day = parseInt(dateObj.day);

        const isLeapYear = (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0));
        const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
          return {
            identifier: input,
            value: false,
            errorMessage: `${this.ToProperCase(friendlyName)} must be a real date`
          };
        }

        // Construct a standardized date string
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Validate the date string format
        const datePattern = /^(\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
        if (!datePattern.test(dateStr)) {
          return {
            identifier: input,
            value: false,
            errorMessage: `${this.ToProperCase(friendlyName)} must be a real date`
          };
        }
      } else {
        // Need to add validation here for cases with just Day and Month
        // (The specific validation logic for this case is not provided in your original code)
      }
    }

    return {
      identifier: input,
      value: true,
      errorMessage: null
    };
  },

  MinDateCheck: function (input, friendlyName, minDate) {
    let dateObj = { day: "", month: "", year: "" };
    const inputs = $(`input[name="${input}"]`);

    inputs.each(function () {
      const id = $(this).attr('id');
      if (id.includes('-day')) {
        dateObj.day = $(this).val();
      } else if (id.includes('-month')) {
        dateObj.month = $(this).val();
      } else if (id.includes('-year')) {
        dateObj.year = $(this).val();
      }
    });

    const dateValues = Object.values(dateObj).filter(Boolean);
    const dateValueCount = dateValues.length;

    if (dateValueCount > 0) {
      const padNumber = (num, places) => String(num).padStart(places, '0');

      const formattedDateObj = Object.keys(dateObj).reduce((formatted, index) => {
        if ((index === "day" || index === "month") && dateObj[index].length < 2) {
          formatted[index] = padNumber(dateObj[index], 2);
        } else {
          formatted[index] = dateObj[index];
        }
        return formatted;
      }, {});

      const dateString = `${formattedDateObj.year}-${formattedDateObj.month}-${formattedDateObj.day}`;
      const currentDate = new Date(dateString);
      const formattedMinDate = new Date(minDate);
      return {
        identifier: input,
        value: currentDate < formattedMinDate ? false : true,
        errorMessage: currentDate < formattedMinDate ? `${this.ToProperCase(friendlyName)} must be the same as or after ${minLengthFormatted}` : null
      }
    }
  },

  IsNumber: function (input, friendlyName) {
    const value = $(`#${input}`).val();

    if (value.length > 0 && isNaN(value)) {
      return {
        identifier: input,
        value: false,
        errorMessage: `${this.ToProperCase(friendlyName)} must be a number`
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      };
    }
  },

  IsWholeNumber: function (input, friendlyName) {
    const value = $(`#${input}`).val();

    if (value.length > 0 && !Number.isInteger(Number(value))) {
      return {
        identifier: input,
        value: false,
        errorMessage: `${this.ToProperCase(friendlyName)} must be a whole number`
      };
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      };
    }
  },

  IsDecimalNumber: function (input, friendlyName) {
    const value = $(`#${input}`).val();

    if (value.length > 0 && !value.includes('.')) {
      return {
        identifier: input,
        value: false,
        errorMessage: `${this.ToProperCase(friendlyName)} must be a decimal number`
      };
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      };
    }
  },

  IsEmail: function (input) {
    const inputLength = $(`#${input}`).val().length;
    if (inputLength > 0) {
      const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,9})+$/;
      return {
        identifier: input,
        value: $(`#${input}`).val().match(mailformat) ? true : false,
        errorMessage: $(`#${input}`).val().match(mailformat) ? null : 'Enter a valid email address'
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  IsTelephone: function (input) {
    const inputVal = $(`#${input}`).val();
    if (inputVal.length > 0) {
      const telephoneFormat = /^((\(?0\d{4}\)?\s?\d{3}\s?\d{3})|(\(?0\d{3}\)?\s?\d{3}\s?\d{4})|(\(?0\d{2}\)?\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
      const mobileFormat = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
      return {
        identifier: input,
        value: inputVal.match(telephoneFormat) || inputVal.match(mobileFormat) ? true : false,
        errorMessage: inputVal.match(telephoneFormat) || inputVal.match(mobileFormat) ? null : "Enter a telephone number in the correct format, like 01632 960 001, 07700 900 982 or +44 808 157 0192"
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  CharacterCountContainerCheck: function (input, friendlyName) {
    const characterCountContainer = $(`#${input}`).closest('govuk-character-count');
    if (characterCountContainer) {
      const inputLength = $(`#${input}`).val().length;
      if (inputLength > 0) {
        const maxLength = $(`#${input}`).closest('.govuk-character-count').attr("data-maxlength");
        if (maxLength) {
          return {
            identifier: input,
            value: inputLength > maxLength ? false : true,
            errorMessage: inputLength > maxLength ? `${this.ToProperCase(friendlyName)} must be ${maxLength} characters or less` : null
          }
        } else {
          return {
            identifier: input,
            value: true,
            errorMessage: null
          }
        }
      } else {
        return {
          identifier: input,
          value: true,
          errorMessage: null
        }
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  WordCountContainerCheck: function (input, friendlyName) {
    const wordCountContainer = $(`#${input}`).closest('govuk-character-count');
    if (wordCountContainer) {
      let inputWordCount = 0;
      let words = $(`#${input}`).val().split(" ");

      inputWordCount = words.filter(function (word) {
        return word.length > 0;
      }).length;

      if (inputWordCount > 0) {
        const maxWords = $(`#${input}`).closest('.govuk-character-count').attr("data-maxwords");
        if (maxWords) {
          return {
            identifier: input,
            value: inputWordCount > maxWords ? false : true,
            errorMessage: inputWordCount > maxWords ? `${this.ToProperCase(friendlyName)} must be ${maxWords} words or less` : null
          }
        } else {
          return {
            identifier: input,
            value: true,
            errorMessage: null
          }
        }
      } else {
        return {
          identifier: input,
          value: true,
          errorMessage: null
        }
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  MinMaxDateChecks: function (input, friendlyName) {
    const maxDate = $(`#${input}`).attr('maxdate');
    const minDate = $(`#${input}`).attr('mindate');
    if (minDate || maxDate) {
      if (maxDate && !minDate) {
        return this.MaxDateCheck(input, friendlyName, maxDate);
      } else if (!maxDate && minDate) {
        return this.MinDateCheck(input, friendlyName, minDate);
      } else if (maxDate && minDate) {
        return this.BetweenDateCheck(input, friendlyName, minDate, maxDate);
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  MinMaxCharacterChecks: function (input, friendlyName, description) {
    const maxLength = $(`#${input}`).attr('maxchar');
    const minLength = $(`#${input}`).attr('minchar');
    if (minLength || maxLength) {
      if (maxLength && !minLength) {
        return this.InputMaxCharacterCheck(input, friendlyName, description, maxLength);
      } else if (!maxLength && minLength) {
        return this.InputMinCharacterCheck(input, friendlyName, description, minLength);
      } else if (maxLength && minLength) {
        return this.InputBetweenCharacterCheck(input, friendlyName, description, minLength, maxLength);
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  MinMaxValueChecks: function (input, friendlyName, description) {
    const maxValue = $(`#${input}`).attr('maxvalue');
    const minValue = $(`#${input}`).attr('minvalue');
    if (minValue || maxValue) {
      if (maxValue && !minValue) {
        return this.InputMaxValueCheck(input, friendlyName, description, maxValue);
      } else if (!maxValue && minValue) {
        return this.InputMinValueCheck(input, friendlyName, description, minValue);
      } else if (maxValue && minValue) {
        return this.InputBetweenValueCheck(input, friendlyName, description, minValue, maxValue);
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  InputMaxCharacterCheck: function (input, friendlyName, description, maxLength) {
    const inputLength = $(`#${input}`).val().length;
    if (inputLength > 0) {
      const maxLengthFormatted = parseInt(maxLength);
      return {
        identifier: input,
        value: inputLength > maxLengthFormatted ? false : true,
        errorMessage: inputLength > maxLengthFormatted ? `${this.ToProperCase(friendlyName)} must be ${maxLengthFormatted} characters or less ${description}` : null
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  InputMinCharacterCheck: function (input, friendlyName, description, minLength) {
    const inputLength = $(`#${input}`).val().length;
    if (inputLength > 0) {
      const minLengthFormatted = parseInt(minLength);
      return {
        identifier: input,
        value: inputLength < minLengthFormatted ? false : true,
        errorMessage: inputLength < minLengthFormatted ? `${this.ToProperCase(friendlyName)} must be ${minLengthFormatted} characters or more ${description}` : null
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  InputBetweenCharacterCheck: function (input, friendlyName, description, minLength, maxLength) {
    const inputLength = $(`#${input}`).val().length;
    const minLengthFormatted = parseInt(minLength);
    const maxLengthFormatted = parseInt(maxLength);

    if (inputLength > 0) {
      if (minLengthFormatted == maxLengthFormatted) {
        return {
          identifier: input,
          value: inputLength == minLength ? true : false,
          errorMessage: inputLength == minLength ? null : `${this.ToProperCase(friendlyName)} must be ${minLength} characters ${description}`
        }
      }
      return {
        identifier: input,
        value: inputLength >= minLengthFormatted && inputLength <= maxLengthFormatted ? true : false,
        errorMessage: inputLength >= minLengthFormatted && inputLength <= maxLengthFormatted ? null : `${this.ToProperCase(friendlyName)} must be between ${minLengthFormatted} and ${maxLengthFormatted} characters ${description}`
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  InputMaxValueCheck: function (input, friendlyName, description, maxValue) {
    const inputValue = parseFloat($(`#${input}`).val());
    const maxValueFormatted = parseInt(maxValue);

    if (!isNaN(inputValue)) {
      return {
        identifier: input,
        value: inputValue > maxValueFormatted ? false : true,
        errorMessage: inputValue > maxValueFormatted ? `${this.ToProperCase(friendlyName)} must be ${maxValueFormatted} or fewer ${description}` : null
      };
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      };
    }
  },

  InputMinValueCheck: function (input, friendlyName, description, minValue) {
    const inputValue = parseFloat($(`#${input}`).val());
    const minValueFormatted = parseInt(minValue);

    if (!isNaN(inputValue)) {
      if (inputValue < minValueFormatted) {
        return { identifier: input, value: false, errorMessage: `${this.ToProperCase(friendlyName)} must be ${minValueFormatted} or more ${description}` };
      } else {
        return { identifier: input, value: true, errorMessage: null };
      }
    } else {
      return { identifier: input, value: true, errorMessage: null };
    }
  },

  InputBetweenValueCheck: function (input, friendlyName, description, minValue, maxValue) {
    const inputValue = parseFloat($(`#${input}`).val());
    const minValueFormatted = parseInt(minValue);
    const maxValueFormatted = parseInt(maxValue);

    if (!isNaN(inputValue)) {
      if (minValueFormatted == maxValueFormatted) {
        return {
          identifier: input,
          value: inputValue == minValueFormatted ? true : false,
          errorMessage: inputValue == minValueFormatted ? null : `${this.ToProperCase(friendlyName)} must be ${minValueFormatted} ${description}`
        }
      }
      return {
        identifier: input,
        value: inputValue >= minValueFormatted && inputValue <= maxValueFormatted ? true : false,
        errorMessage: inputValue >= minValueFormatted && inputValue <= maxValueFormatted ? null : `${this.ToProperCase(friendlyName)} must be between ${minValueFormatted} and ${maxValueFormatted} ${description}`
      }
    } else {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }
  },

  TextInputSearchValidation: async function (input, targetEntity, targetEntitySearchField, targetEntityPrimaryKey, friendlyName) {
    const inputVal = $(`#${input}`).val();

    if (!inputVal) {
      return {
        identifier: input,
        value: true,
        errorMessage: null
      }
    }

    const searchQuery = `?$select=${targetEntityPrimaryKey}&$filter=(${targetEntitySearchField} eq '${inputVal}')`;

    try {
      const res = await webapi.safeAjax({
        type: "GET",
        url: `/_api/${targetEntity}${searchQuery}`,
        contentType: "application/json"
      });

      return {
        identifier: input,
        value: res.value.length > 0,
        errorMessage: res.value.length > 0 ? null : this.ToProperCase(`${friendlyName} cannot be found`),
        targetEntityId: res.value.length > 0 ? res.value[0][targetEntityPrimaryKey] : null
      };
    } catch (error) {
      console.error(error);
      return {
        identifier: input,
        value: false,
        errorMessage: "Error performing search. Please contact the DfE."
      };
    }
  },

  FileSizeCheck: function(input, maxFileSize) {
    const $fileInput = $(`#${input}`);
    const files = $fileInput[0].files;

    const maxFileSizeInBytes = maxFileSize * 1024 * 1024; // Convert MB to bytes
    let errorMessage = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxFileSizeInBytes) {
        errorMessage += this.ToProperCase(`The selected file "${file.name}" must be smaller than ${maxFileSize}MB`);
      }
    }

    return {
      identifier: input,
      value: errorMessage === '',
      errorMessage: errorMessage || null
    };
  },

  FileLimitCheck: function(input, maxLimit) {
    const $fileInput = $(`#${input}`);
    const files = $fileInput[0].files; // Accessing the files from the DOM element
    const filesLength = files.length;
    
    const errorMessage = maxLimit === 1
      ? `You can only select up to ${maxLimit} file at the same time.`
      : `You can only select up to ${maxLimit} files at the same time.`;

    return {
      identifier: input,
      value: filesLength <= maxLimit,
      errorMessage: filesLength > maxLimit ? errorMessage : null
    };
  },

  ValidFileExtensionCheck: function(identifier, allowedExtensions) {
    const files = $(`#${identifier}`)[0].files;
    const invalidFiles = [];

    Array.from(files).forEach(file => {
      const fileName = file.name;
      const fileExtension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        invalidFiles.push(fileName);
      }
    });

    // Construct the allowed extensions string
    const allowedExtensionsStr = allowedExtensions.join(", ").replace(/, ([^,]*)$/, ' or $1');

    return {
      identifier: identifier,
      value: invalidFiles.length === 0,
      errorMessage: invalidFiles.length > 0 ? 
        invalidFiles.map(file => `The selected file '${file}' must be a ${allowedExtensionsStr}.`).join("\n") : 
        null
    };
  },

  VirusCheck: async function(identifier, flowId) {
    try {
      const filesDataArray = await DfEPortal.GetFileContent(identifier);
      
      const virusCheckPromises = filesDataArray.map(fileData => {
        let dataObj = {}
        dataObj["fileContent"] = {
          "file": {
            "name": fileData.fileName,
            "contentBytes": fileData.fileContent,
          }     
        };

        const request = {};
        request.eventData = JSON.stringify(dataObj);
        return DfEPortal.WebApi.CallCloudFlow(flowId, request);
      });

      const results = await Promise.all(virusCheckPromises);

      const failedFiles = results
      .filter(result => !result.isFileClean || !result.scanSuccess)
      .map((result, index) => filesDataArray[index].fileName);

      if (failedFiles.length > 0) {
        const errorMessage = failedFiles.map(fileName => `The file "${fileName}" contains a virus.`).join('\n');
        return {
          identifier: identifier,
          value: false,
          errorMessage: errorMessage
        }
      }

      return {
        identifier: identifier,
        value: true,
        errorMessage: null
      };
    } catch (error) {
      console.error(error);
      return {
        identifier: identifier,
        value: false,
        errorMessage: "An error occurred. Please try again."
      };
    }
  },

  ToProperCase: function (text) {
    return text[0].toUpperCase() + text.substr(1)
  },
}

DfEPortal.Errors = {

  ShowInputError: function (input, type, message) {
    const formGroup = type === "radio" || type === "checkbox"
      ? $(`input[name='${input}']`).closest('.govuk-form-group')
      : $(`#${input}`).closest('.govuk-form-group');

    const errorContainerId = `${input}-error`;
    let errorContainer = $(`#${errorContainerId}`);
    let errorMessageSpan;

    if (errorContainer.length === 0) {
      errorContainer = $('<p/>', {
        id: errorContainerId,
        class: 'govuk-error-message',
      });

      const errorSpan = $('<span/>', {
        class: 'govuk-visually-hidden',
        text: 'Error:',
      });

      errorMessageSpan = $('<span/>', {
        id: `${input}-error-message`,
        text: message,
      });

      errorContainer.append(errorSpan);
      errorSpan.after(errorMessageSpan);

      if (type === "radio") {
        formGroup.find('.govuk-radios').before(errorContainer);
        let describedBy = formGroup.find('fieldset').attr("aria-describedby");
        describedBy = describedBy ? `${describedBy} ${errorContainerId}` : errorContainerId;
        formGroup.find('fieldset').attr("aria-describedby", describedBy);
      } else if (type === "checkbox") {
        formGroup.find('.govuk-checkboxes').before(errorContainer);
        let describedBy = formGroup.find('fieldset').attr("aria-describedby");
        describedBy = describedBy ? `${describedBy} ${errorContainerId}` : errorContainerId;
        formGroup.find('fieldset').attr("aria-describedby", describedBy);
      } else if (type === "date") {
        formGroup.find('.govuk-date-input').before(errorContainer);
        let describedBy = formGroup.find('fieldset').attr("aria-describedby");
        describedBy = describedBy ? `${describedBy} ${errorContainerId}` : errorContainerId;
        formGroup.find('fieldset').attr("aria-describedby", describedBy);
      } else if (type === "select") {
        formGroup.find('select').before(errorContainer);
        let describedBy = formGroup.find('select').attr("aria-describedby");
        describedBy = describedBy ? `${describedBy} ${errorContainerId}` : errorContainerId;
        formGroup.find('select').attr("aria-describedby", describedBy);
      } else if (type === "text-area") {
        formGroup.find('textarea').before(errorContainer);
        let describedBy = formGroup.find('textarea').attr("aria-describedby");
        describedBy = describedBy ? `${describedBy} ${errorContainerId}` : errorContainerId;
        formGroup.find('textarea').attr("aria-describedby", describedBy);
      } else if (type === "text" || type === "tel" || type === "email" || type === "number" || type === "whole-number" || type === "decimal-number" || type === "file") {
        if ($(`#${input}`).attr("type") == "search") {
          formGroup.find('.dfe-form-search__item-wrapper').before(errorContainer);
        } else {
          const wrapper = formGroup.find('.govuk-input__wrapper');
          const input = formGroup.find('input');
          wrapper.length > 0 ? wrapper.before(errorContainer) : input.before(errorContainer);
        }
        let describedBy = formGroup.find('input').attr("aria-describedby");
        describedBy = describedBy ? `${describedBy} ${errorContainerId}` : errorContainerId;
        formGroup.find('input').attr("aria-describedby", describedBy);
      }
    } else {
      errorMessageSpan = $(`#${input}-error-message`);
      errorMessageSpan.text(message);
    }

    formGroup.addClass('govuk-form-group--error');

    if (type === "select") {
      $(`#${input}`).addClass('govuk-select--error');
    } else if (type === "date") {
      $(`#${input} input`).addClass('govuk-input--error');
    } else if (type === "text-area") {
      $(`#${input}`).addClass('govuk-textarea--error');
    } else if (type === "text" || type === "tel" || type === "email" || type === "number" || type === "whole-number" || type === "decimal-number" || type === "file") {
      $(`#${input}`).addClass('govuk-input--error');
    }
  },


  ClearInputError: function (input, type) {
    const formGroup = type === "radio" || type === "checkbox"
      ? $(`input[name='${input}']`).closest('.govuk-form-group')
      : $(`#${input}`).closest('.govuk-form-group');

    const errorContainerId = `${input}-error`;
    const errorContainer = $(`#${errorContainerId}`);

    if (errorContainer.length > 0) {
      errorContainer.remove();
    }

    formGroup.removeClass('govuk-form-group--error');

    if (type === "radio" || type === "checkbox" || type === "date") {
      const fieldSet = formGroup.find('fieldset');
      let describedBy = fieldSet.attr("aria-describedby");
      if (describedBy !== undefined && describedBy.includes(errorContainerId)) {
        describedBy = describedBy.replace(errorContainerId, "")
        if (describedBy.trim() === "") {
          fieldSet.removeAttr("aria-describedby");
        } else {
          fieldSet.attr("aria-describedby", describedBy.trim());
        }
      }
    } else if (type === "select") {
      const select = formGroup.find('select');
      let describedBy = select.attr("aria-describedby");
      if (describedBy !== undefined && describedBy.includes(errorContainerId)) {
        describedBy = describedBy.replace(errorContainerId, "")
        if (describedBy.trim() === "") {
          select.removeAttr("aria-describedby");
        } else {
          select.attr("aria-describedby", describedBy.trim());
        }
      }
    } else if (type === "text-area") {
      const textArea = formGroup.find('textarea');
      let describedBy = textArea.attr("aria-describedby");
      if (describedBy !== undefined && describedBy.includes(errorContainerId)) {
        describedBy = describedBy.replace(errorContainerId, "")
        if (describedBy.trim() === "") {
          textArea.removeAttr("aria-describedby");
        } else {
          textArea.attr("aria-describedby", describedBy.trim());
        }
      }
    } else if (type === "text" || type === "tel" || type === "email" || type === "number" || type === "whole-number" || type === "decimal-number") {
      const inputComponent = formGroup.find('input');
      let describedBy = inputComponent.attr("aria-describedby");
      if (describedBy !== undefined && describedBy.includes(errorContainerId)) {
        describedBy = describedBy.replace(errorContainerId, "")
        if (describedBy.trim() === "") {
          inputComponent.removeAttr("aria-describedby");
        } else {
          inputComponent.attr("aria-describedby", describedBy.trim());
        }
      }
    }

    if (type === "select") {
      $(`#${input}`).removeClass('govuk-select--error');
    } else if (type === "date") {
      $(`#${input} input`).removeClass('govuk-input--error');
    } else if (type === "text-area") {
      $(`#${input}`).removeClass('govuk-textarea--error');
    } else if (type === "text" || type === "tel" || type === "email" || type === "number" || type === "whole-number" || type === "decimal-number") {
      $(`#${input}`).removeClass('govuk-input--error');
    }
  },

  HideErrorSummary: function () {
    $('.govuk-error-summary').remove();
  },

  ShowErrorSummary: function () {
    let errorSummary = $(`.govuk-error-summary`);
    if (errorSummary.length === 0) {

      errorSummary = $('<div>').addClass('govuk-error-summary').attr('data-module', 'govuk-error-summary');
      var alertDiv = $('<div>').attr('role', 'alert');
      var title = $('<h2>').addClass('govuk-error-summary__title').text('There is a problem');
      var body = $('<div>').addClass('govuk-error-summary__body');
      var ul = $('<ul>').addClass('govuk-list govuk-error-summary__list');

      // Append the elements to construct the structure
      body.append(ul);
      alertDiv.append(title, body);
      errorSummary.append(alertDiv);

      // Append the error summary component to the container
      $('#error-summary-container').append(errorSummary);
    }
  },

  FocusErrorSummary: function (scrollOptions) {

    if (scrollOptions && typeof scrollOptions === 'object') {
      const { offset = 0, duration = 1000 } = scrollOptions;

      $('html, body').animate(
        {
          scrollTop: $('.govuk-error-summary').offset().top + offset
        },
        duration
      );
    } else {
      $('html, body').animate({
        scrollTop: $('.govuk-error-summary').offset().top
      }, 1000);
    }

    $('.govuk-error-summary__title').trigger('focus');
  },

  AddErrorSummaryDetail: function (input, message) {
    const errorSummaryList = $('.govuk-error-summary__list');
    const errorSummaryLink = errorSummaryList.find(`a[href='#${input}-error']`);

    if (input === "") {
      const listElem = $('<li><a href="#">' + message + '</a></li>');
      errorSummaryList.append(listElem);
      return;
    }

    if (errorSummaryLink.length > 0) {
      errorSummaryLink.text(message);
      return;
    }

    const listElem = $('<li><a href="#' + input + '-error">' + message + '</a></li>');
    errorSummaryList.append(listElem);
  },

  RemoveErrorSummaryDetail: function (input) {
    const errorSummaryLink = $(`a[href='#${input}-error']`);
    if (errorSummaryLink.length) {
      errorSummaryLink.closest('li').remove();
    }
  },

  ShowWebApiError: function () {
    this.ShowErrorSummary();
    this.AddErrorSummaryDetail("submit-btn", "There has been a problem submitting your information. Please contact the DfE.");
  }
}

DfEPortal.WebApi = {

  Init: function () {
    (function (webapi, $) {
      function safeAjax(ajaxOptions) {
        var deferredAjax = $.Deferred();

        shell.getTokenDeferred().done(function (token) {
          // add headers for AJAX
          if (!ajaxOptions.headers) {
            $.extend(ajaxOptions, {
              headers: {
                "__RequestVerificationToken": token
              }
            });
          } else {
            ajaxOptions.headers["__RequestVerificationToken"] = token;
          }
          $.ajax(ajaxOptions)
            .done(function (data, textStatus, jqXHR) {
              validateLoginSession(data, textStatus, jqXHR, deferredAjax.resolve);
            }).fail(deferredAjax.reject); //AJAX
        }).fail(function () {
          deferredAjax.rejectWith(this, arguments); // on token failure pass the token AJAX and args
        });

        return deferredAjax.promise();
      }
      webapi.safeAjax = safeAjax;
    })(window.webapi = window.webapi || {}, jQuery)
    // Notification component
    var notificationMsg = (function () {
      var $processingMsgEl = $('#processingMsg'),
        _msg = 'Processing...',
        _stack = 0,
        _endTimeout;
      return {
        show: function (msg) {
          $processingMsgEl.text(msg || _msg);
          if (_stack === 0) {
            clearTimeout(_endTimeout);
            $processingMsgEl.show();
          }
          _stack++;
        },
        hide: function () {
          _stack--;
          if (_stack <= 0) {
            _stack = 0;
            clearTimeout(_endTimeout);
            _endTimeout = setTimeout(function () {
              $processingMsgEl.hide();
            }, 500);
          }
        }
      }
    })();
  },

  ConstructData: async function (obj) {
    return new Promise(async (resolve, reject) => {
      let data = {};

      function handleInternalError(errorMessage) {
        console.error(errorMessage);
        DfEPortal.Errors.ShowWebApiError();
        reject();
      }

      function handleText(objItem) {
        if (objItem.targetType === "lookup") {
          const { identifier, targetEntity, targetEntityId } = objItem;
          const isTargetEntityIdDefined = targetEntityId !== undefined;

          const dataKey = isTargetEntityIdDefined ? `${identifier}@odata.bind` : identifier;
          const dataValue = isTargetEntityIdDefined
            ? `/${targetEntity}(${targetEntityId})`
            : null;

          $.extend(data, { [dataKey]: dataValue });
        } else {
          $.extend(data, { [objItem.identifier]: $(`#${objItem.identifier}`).val() });
        }
      }


      function handleNumber(objItem) {
        const inputMode = $(`#${objItem.identifier}`).attr("inputmode");
        const isNumericInput = inputMode === "numeric";

        const dataValue = isNumericInput
          ? parseInt($(`#${objItem.identifier}`).val())
          : $(`#${objItem.identifier}`).val();

        $.extend(data, { [objItem.identifier]: dataValue });
      }

      function handleDecimalNumber(objItem) {
        const inputMode = $(`#${objItem.identifier}`).attr("inputmode");
        const isNumericInput = inputMode === "numeric";

        const dataValue = isNumericInput
          ? parseFloat($(`#${objItem.identifier}`).val())
          : $(`#${objItem.identifier}`).val();

        $.extend(data, { [objItem.identifier]: dataValue });
      }

      function handleDate(objItem) {
        let dateObj = {};
        const inputs = $(`input[name="${objItem.identifier}"]`);

        inputs.each(function () {
          const id = $(this).attr('id');
          if (id.includes('-day')) {
            dateObj.day = $(this).val();
          } else if (id.includes('-month')) {
            dateObj.month = $(this).val();
          } else if (id.includes('-year')) {
            dateObj.year = $(this).val();
          }
        });

        const dateValues = Object.values(dateObj).filter(Boolean);
        const dateValueCount = dateValues.length;

        if (dateValueCount > 0) {
          const padNumber = (num, places) => String(num).padStart(places, '0');

          const formattedDateObj = Object.keys(dateObj).reduce((formatted, index) => {
            if ((index === "day" || index === "month") && dateObj[index].length < 2) {
              formatted[index] = padNumber(dateObj[index], 2);
            } else {
              formatted[index] = dateObj[index];
            }
            return formatted;
          }, {});

          const dateString = `${formattedDateObj.day}/${formattedDateObj.month}/${formattedDateObj.year}`;

          if (objItem.targetType === "text") {
            $.extend(data, { [objItem.identifier]: dateString });
          } else {
            const isoDate = new Date(`${formattedDateObj.year}-${formattedDateObj.month}-${formattedDateObj.day}`).toISOString().split('T')[0];
            $.extend(data, { [objItem.identifier]: isoDate });
          }
        } else {
          $.extend(data, { [objItem.identifier]: null });
        }
      }

      function handleRadio(objItem) {
        if (objItem.targetType !== null) {
          switch (objItem.targetType) {
            case "lookup":
              if (objItem.targetEntity !== null) {
                const inputName = `input[name='${objItem.identifier}']`;
                const isChecked = $(inputName).is(':checked');
                const checkedValue = isChecked ? $(inputName + ':checked').val() : null;

                const odataBindValue = isChecked
                  ? `/${objItem.targetEntity}(${checkedValue})`
                  : null;

                const key = odataBindValue != null
                  ? `${objItem.identifier}@odata.bind`
                  : `${objItem.identifier}`

                $.extend(data, {
                  [`${key}`]: odataBindValue,
                });
              } else {
                handleInternalError(`'targetEntity' is missing from the data object`);
              }
              break;

            case "bool":
              const value = $(`input[name='${objItem.identifier}']:checked`).val();
              $.extend(data, {
                [objItem.identifier]: value === "1" ? true : false,
              });
              break;

            case "select":
              $.extend(data, {
                [objItem.identifier]: parseInt($(`input[name='${objItem.identifier}']:checked`).val()),
              });
              break;

            case "text":
              const checkedId = $(`input[name='${objItem.identifier}']:checked`).attr('id');
              $.extend(data, {
                [objItem.identifier]: $(`label[for='${checkedId}']`).text().trim(),
              });
              break;

            default:
              handleInternalError(`'${objItem.targetType}' is not a valid targetType for type '${objItem.type}'`);
              break;
          }
        } else {
          handleInternalError(`'targetType' is missing from the data object`);
        }
      }

      function handleCheckbox(objItem) {
        if (objItem.targetType !== null) {
          const length = $(`input[name='${objItem.identifier}']:checked`).length;
          switch (objItem.targetType) {
            case "bool":
              if (length === 1) {
                const value = $(`input[name='${objItem.identifier}']:checked`).val();
                $.extend(data, {
                  [objItem.identifier]: value === "1" ? true : false,
                });
              } else {
                handleInternalError(`${objItem.targetType} targetType can only accept a single selection`);
              }
              break;

            case "select":
              if (length === 1) {
                $.extend(data, {
                  [objItem.identifier]: parseInt($(`input[name='${objItem.identifier}']:checked`).val()),
                });
              } else {
                handleInternalError(`${objItem.targetType} targetType can only accept a single selection.`);
              }
              break;

            case "multi-select":
              if (length === 1) {
                $.extend(data, {
                  [objItem.identifier]: String($(`input[name='${objItem.identifier}']:checked`).val()),
                });
              } else if (length > 1) {
                let options = $(`input[name='${objItem.identifier}']:checked`).map((index, input) => {
                  return String($(input).val());
                }).get().join(',');

                $.extend(data, {
                  [objItem.identifier]: options,
                });
              } else {
                handleInternalError(`${objItem.targetType} targetType error.`);
              }
              break;

            case "text":
              if (length === 1) {
                const checkedId = $(`input[name='${objItem.identifier}']:checked`).attr('id');
                const labelText = $(`label[for='${checkedId}']`).text().trim();
                $.extend(data, {
                  [objItem.identifier]: labelText,
                });
              } else {
                let options = [];
                $.each($(`input[name='${objItem.identifier}']:checked`), (index, input) => {
                  const checkedId = $(input).attr('id');
                  const labelText = $(`label[for='${checkedId}']`).text().trim();
                  options.push(labelText);
                });
                $.extend(data, {
                  [objItem.identifier]: options,
                });
              }
              break;

            default:
              handleInternalError(`'${objItem.targetType}' is not a valid targetType for type '${objItem.type}'`);
              break;
          }
        } else {
          handleInternalError(`'targetType' is missing from the data object`);
        }
      }

      function handleSelect(objItem) {
        if (objItem.targetType !== null) {
          switch (objItem.targetType) {
            case "lookup":
              if (objItem.targetEntity !== null) {
                const selectedValue = $(`#${objItem.identifier} option:selected`).val();

                const odataBindValue = selectedValue
                  ? `/${objItem.targetEntity}(${selectedValue})`
                  : null;

                const key = odataBindValue != null
                  ? `${objItem.identifier}@odata.bind`
                  : `${objItem.identifier}`
                  
                $.extend(data, {
                  [`${key}`]: odataBindValue,
                });
              } else {
                handleInternalError(`'targetEntity' is missing from the data object`);
              }
              break;

            case "select":
              $.extend(data, {
                [objItem.identifier]: parseInt($(`#${objItem.identifier} option:selected`).val()),
              });
              break;

            case "text":
              $.extend(data, {
                [objItem.identifier]: $(`#${objItem.identifier} option:selected`).text(),
              });
              break;

            default:
              handleInternalError(`'${objItem.targetType}' is not a valid targetType for type '${objItem.type}'`);
              break;
          }
        } else {
          handleInternalError(`'targetType' is missing from the data object`);
        }
      }

      $.each(obj, function (i, objItem) {
        if (objItem.type === "text") {
          handleText(objItem);
        } else if (objItem.type === "text-area" || objItem.type === "email" || objItem.type === "tel") {
          $.extend(data, {
            [objItem.identifier]: $(`#${objItem.identifier}`).val(),
          });
        } else if (objItem.type === "whole-number") {
          handleNumber(objItem);
        } else if (objItem.type === "decimal-number" || objItem.type === "number") {
          handleDecimalNumber(objItem);
        } else if (objItem.type === "date") {
          handleDate(objItem);
        } else if (objItem.type === "radio") {
          handleRadio(objItem);
        } else if (objItem.type === "checkbox") {
          handleCheckbox(objItem);
        } else if (objItem.type === "select") {
          handleSelect(objItem);
        }
      });

      async function waitForData() {
        while (Object.keys(data).length === 0) {
          // Wait for the data object to be populated
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        resolve(data);
      }

      waitForData();
    });
  },

  Update: function (id, entityName, dataObj) {
    return new Promise((resolve, reject) => {
      webapi.safeAjax({
        type: "PATCH",
        url: `/_api/${entityName}(${id})`,
        contentType: "application/json",
        data: JSON.stringify(dataObj),
        success: function (data, textStatus, jqXHR) {
          resolve();
        },
        error: function (xhr, status, error) {
          DfEPortal.Errors.ShowWebApiError();
          const errorObj = {
            status: xhr.status,             
            statusText: xhr.statusText,     
            responseText: xhr.responseText,
            error: error                    
          };
          reject(errorObj);
        },
      });
    });
  },

  Create: function (entityName, dataObj) {
    return new Promise((resolve, reject) => {
      webapi.safeAjax({
        type: "POST",
        url: `/_api/${entityName}`,
        contentType: "application/json",
        data: JSON.stringify(dataObj),
        success: function (data, textStatus, jqXHR) {
          resolve(jqXHR.getResponseHeader("entityid"));
        },
        error: function (xhr, status, error) {
          DfEPortal.Errors.ShowWebApiError();
          const errorObj = {
            status: xhr.status,             
            statusText: xhr.statusText,     
            responseText: xhr.responseText,
            error: error                    
          };
          reject(errorObj);
        },
      });
    });
  },

  Retrieve: function (entityName, searchQuery) {
    return new Promise((resolve, reject) => {
      webapi.safeAjax({
        type: "GET",
        url: `/_api/${entityName}${searchQuery}`,
        contentType: "application/json",
        success: function (data, textStatus, jqXHR) {
          resolve(data);
        },
        error: function (xhr, status, error) {
          DfEPortal.Errors.ShowWebApiError();
          const errorObj = {
            status: xhr.status,             
            statusText: xhr.statusText,     
            responseText: xhr.responseText,
            error: error                    
          };
          reject(errorObj);
        },
      });
    });
  },

  Delete: function (id, entityName) {
    return new Promise((resolve, reject) => {
      webapi.safeAjax({
        type: "DELETE",
        url: `/_api/${entityName}(${id})`,
        contentType: "application/json",
        success: function (data, textStatus, jqXHR) {
          resolve();
        },
        error: function (xhr, status, error) {
          DfEPortal.Errors.ShowWebApiError();
          const errorObj = {
            status: xhr.status,             
            statusText: xhr.statusText,     
            responseText: xhr.responseText,
            error: error                    
          };
          reject(errorObj);
        },
      });
    });
  },

  Associate: function (id, entityName, relationshipName, dataObj) {
    return new Promise((resolve, reject) => {
      webapi.safeAjax({
        type: "POST",
        url: `/_api/${entityName}(${id})/${relationshipName}/$ref`,
        contentType: "application/json",
        data: JSON.stringify(dataObj),
        success: function (data, textStatus, jqXHR) {
          resolve(data);
        },
        error: function (xhr, status, error) {
          DfEPortal.Errors.ShowWebApiError();
          const errorObj = {
            status: xhr.status,             
            statusText: xhr.statusText,     
            responseText: xhr.responseText,
            error: error                    
          };
          reject(errorObj);
        },
      });
    });
  },

  CallCloudFlow: function(flowApiId, dataObj) {
    return new Promise((resolve, reject) => {
      shell.ajaxSafePost({
        type: "POST",
        url: `/_api/cloudflow/v1.0/trigger/${flowApiId}`,
        contentType: "application/json",
        data: JSON.stringify(dataObj),
        success: function(res, status, xhr) {
          try {
            const result = JSON.parse(res);
            const isFileClean = result["cleanfile"];
            const scanSuccess = result["scansuccess"];
            resolve({ isFileClean, scanSuccess });
          } catch (error) {
            reject({
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText,
              error: 'Error parsing the response'
            });
          }
        },
        error: function(xhr, status, error) {
          const errorObj = {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText,
            error: error
          };
          reject(errorObj);
        },
      });
    });
  },

  UploadFile: function (inputName, entityName, entityId) {
    try {
      // Get the name of the selected file
      var fileName = encodeURIComponent($(`#${inputName}`).files[0].name);
      // Get the content of the selected file
      var file = $(`#${inputName}`).files[0];
      // If the user has selected a file
      if (file) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async function (e) {
          var fileContent = e.target.result;
          // Run the function to upload to the Portal Web API, passing the GUID of the newly created record and the file's contents and name as inputs 
          const fileObj = await Promise(DfEPortal.WebApi.UploadColumnFile(fileContent, fileName, entityId, entityName, inputName));
          if (fileObj.resolve === true) {
            DfEPortal.Errors.HideErrorSummary();
            return Promise.resolve();
          } else {
            console.error(fileObj);
            DfEPortal.Errors.ShowWebApiError();
            return Promise.reject();
          }
        }
      }
    } catch (error) {
      console.error(error);
      DfEPortal.Errors.ShowWebApiError();
      return Promise.reject();
    }
  },

  UploadColumnFile: async function (fileContent, fileName, entityID, entityName, inputName) {
    return new Promise((resolve, reject) => {
      webapi.safeAjax({
        type: "PUT",
        url: `/_api/${entityName}(${entityID})/${inputName}?x-ms-file-name=${fileName}`,
        contentType: "application/octet-stream",
        data: fileContent,
        processData: false,
        success: function (data, textStatus, xhr) {
          resolve({
            input: inputName,
            resolve: true,
            fileName: fileName
          });
        },
        error: function (xhr, textStatus, errorThrown) {
          reject({
            input: inputName,
            resolve: false,
            errorMessage: "Error uploading file"
          })
        }
      });
    });
  },

  DeleteFile: function (inputName, entityID, entityName) {
    return new Promise((resolve, reject) => {
      webapi.safeAjax({
        type: "DELETE",
        url: `/_api/${entityName}(${entityID})/${inputName}`,
        contentType: "application/json",
        success: function (data, textStatus, xhr) {
          resolve(inputName);
        },
        error: function (xhr, textStatus, errorThrown) {
          reject({
            input: inputName,
            errorMessage: "Error deleting file"
          })
        }
      });
    })
  },

  ProcessFileAndUploadToNotes(inputName, entityName, entityId) {

    return new Promise((resolve, reject) => {
      // Get the name of the selected file
      var fileName = encodeURIComponent(document.getElementById(inputName).files[0].name);

      // Get the mimetype of the selected file
      var mimeType = $(`#${inputName}`).files[0].type;

      // Get the content of the selected file
      var file = $(`#${inputName}`).files[0];

      // If the user has selected a file
      if (file) {
        // Read the file as a byte array
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        // The browser has finished reading the file, we can now do something with it...
        reader.onload = function (e) {
          // The browser has finished reading the file, we can now do something with it...
          var fileContent = e.target.result;

          // Run the function to upload to the Portal Web API, passing the GUID of the newly created record and the file's contents and name as inputs 
          DfEPortal.WebApi.UploadNotesFile(fileContent, fileName, mimeType, entityId, entityName, inputName)
            .then((fileObj) => {
              resolve(fileObj);
            })
            .catch(errorObj => {
              reject(errorObj);
            });
        }
      } else {
        reject({
          input: inputName,
          errormessage: "File content not found"
        })
      }
    });
  },

  UploadNotesFile(fileContent, fileName, mimeType, entityID, entityName, inputName) {
    return new Promise((resolve, reject) => {
      const dataObj = {
        "notetext": "*WEB*",
        "filename": fileName,
        "mimetype": mimeType,
        "documentbody": fileContent,
        "objecttypecode": entityName,
        [`objectid_${entityName}@odata.bind`]: `/${entityName}s("${entityID}")`

      }
      webapi.safeAjax({
        type: "POST",
        url: "/_api/annotations",
        contentType: "application/json",
        data: JSON.stringify(dataObj),
        success: function (data, textStatus, xhr) {
          // Provide some visual feedback re successful upload
          console.log("File uploaded!");
          resolve({
            input: inputName,
            fileName: fileName
          });
        },
        error: function (xhr, textStatus, errorThrown) {
          reject({
            input: inputName,
            errorMessage: "Error uploading file"
          })
        }
      });
    });
  },
}

DfEPortal.Cookies = {

  SetCookie: function (cookieName, cookieValue, expirationDays) {
    var d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
  },

  GetCookieValue: function (cookieName) {
    return new Promise(function (resolve, reject) {
      var name = cookieName + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var cookieArray = decodedCookie.split(';');

      for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) == 0) {
          resolve(cookie.substring(name.length, cookie.length));
          return;
        }
      }
      reject(new Error(`Cookie with name ${cookieName} not found`));
    });
  },

  CheckCookieExists: function (cookieName) {
    return new Promise(function (resolve, reject) {
      const cookies = document.cookie.split(';');

      for (var i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        if (cookie.startsWith(cookieName + '=')) {
          const cookieParts = cookie.split('=');
          const cookieValue = cookieParts[1];

          // Check if the cookie has an expiration date
          if (cookieValue.indexOf(';') !== -1) {
            const expirationDate = new Date(cookieValue.split(';')[1].trim());

            // Check if the cookie has expired
            if (expirationDate < new Date()) {
              reject(new Error('Cookie has expired'));
            } else {
              resolve(true); // Cookie is still valid
            }
          } else {
            resolve(true); // Cookie doesn't have an expiration date, assume it's valid
          }
        }
      }

      // Cookie doesn't exist
      resolve(false);
    });
  }
}