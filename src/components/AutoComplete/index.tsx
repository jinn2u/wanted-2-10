import { ChangeEvent, KeyboardEvent, MouseEvent, useCallback, useState } from 'react';
import { Input, Li, Ul, Wrapper } from './style';
import { Props, TypeDropdownList } from './types';
import { api } from './utils/api';
import { changeDropdownListColor } from './utils/changeDropdownListColor';
import { createDropdownListAndSetDropDownOpen } from './utils/createDropdownListAndSetDropDownOpen';
import { findName } from './utils/findName';
import { findNextWordIdx } from './utils/findNextWordIdx';
import { useUpdateAutoComplete } from './utils/useUpdateAutoComplete';

const AutoComplete = ({
  width = 300,
  setAutoCompleteInput,
  setWordList,
  autoCompleteInput,
  wordList,
  handleSubmit,
  ...props
}: Props) => {
  const [dropdownList, setDropdownList] = useState<TypeDropdownList>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setAutoCompleteInput(value);

    if (!value.length) {
      setShowDropdown(false);
      return setDropdownList([]);
    }
    const newWordList = await api(value);
    setWordList(newWordList);
    createDropdownListAndSetDropDownOpen(newWordList, value, setDropdownList, setShowDropdown);
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const inputValue = (e.target as HTMLInputElement).value;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
    if (!inputValue) return;
    if (!dropdownList.length && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) return;
    if (inputValue && !dropdownList.length) return;
    const [idx, name] = findName(dropdownList, inputValue);

    if (e.key === 'Enter') {
      useUpdateAutoComplete(
        name,
        wordList,
        setShowDropdown,
        setAutoCompleteInput,
        setDropdownList,
        handleSubmit,
      );
      return;
    }

    const nextWordIdx = findNextWordIdx(e.key, idx, dropdownList);
    setAutoCompleteInput(dropdownList[nextWordIdx].name);
    setDropdownList((prevDropdownList) => changeDropdownListColor(prevDropdownList, nextWordIdx));
  };

  const handleLiClick = (name: string) => {
    useUpdateAutoComplete(
      name,
      wordList,
      setShowDropdown,
      setAutoCompleteInput,
      setDropdownList,
      handleSubmit,
    );
    setAutoCompleteInput(name);
    return;
  };
  const handleInputClick = () => {
    if (!dropdownList.length) return;
    setShowDropdown(true);
  };
  return (
    <Wrapper>
      <Input
        width={width}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onClick={handleInputClick}
        value={autoCompleteInput}
      />
      {showDropdown && (
        <Ul width={width}>
          {dropdownList.map(({ id, name, isSelected }) => (
            <Li key={id} isSelected={isSelected} onClick={() => handleLiClick(name)}>
              {name}
            </Li>
          ))}
        </Ul>
      )}
    </Wrapper>
  );
};
export default AutoComplete;
