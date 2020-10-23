export const goUp = (curPosition) => {
    if (curPosition > 7) {
        return curPosition - 8;
    }
    return curPosition;
}
export const goDown = (curPosition) => {
    if (curPosition < 56) {
        return curPosition + 8;
    }
    return curPosition;
}
export const goLeft = (curPosition) => {
    if (!leftBoards.includes(curPosition)) {
        return curPosition - 1;
    }
    return curPosition;
};
export const goRight = (curPosition) => {
    if (!rightBoards.includes(curPosition)) {
        return curPosition + 1;
    }
    return curPosition;
};

export const goUpFire = (nextFirePosition) => {
    firePosition = goUp(nextFirePosition);
    while (!posIsBusyByStone(stonesArray, firePosition) && !posIsBusyByPlayer(players, firePosition) && firePosition > 7) {
        nextFirePosition = firePosition;
        firePosition = goUp(nextFirePosition);
    }
    return firePosition
}

export const goDownFire = (nextFirePosition) => {
    firePosition = goDown(nextFirePosition);
    while (!posIsBusyByStone(stonesArray, firePosition) && !posIsBusyByPlayer(players, firePosition) && firePosition < 56) {
        nextFirePosition = firePosition;
        firePosition = goDown(nextFirePosition);
    }
    return firePosition
}

export const goLeftFire = (nextFirePosition) => {
    firePosition = goLeft(nextFirePosition);
    while (!posIsBusyByStone(stonesArray, firePosition) && !posIsBusyByPlayer(players, firePosition) && !leftBoards.includes(firePosition)) {
        nextFirePosition = firePosition;
        firePosition = goLeft(nextFirePosition);
    }
    return firePosition
}

export const goRightFire = (nextFirePosition) => {
    firePosition = goRight(nextFirePosition);
    while (!posIsBusyByStone(stonesArray, firePosition) && !posIsBusyByPlayer(players, firePosition) && !rightBoards.includes(firePosition)) {
        nextFirePosition = firePosition;
        firePosition = goRight(nextFirePosition);
    }
    return firePosition
}