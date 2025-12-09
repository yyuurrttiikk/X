(() => {
    const $followButtons = '[data-testid$="-unfollow"]';
    const $confirmButton = '[data-testid="confirmationSheetConfirm"]';
    let unfollowed = 0;
    const maxUnfollows = 100;
    let retry = { count: 0, limit: 5 };

    const scrollToTheBottom = () => window.scrollTo(0, document.body.scrollHeight);
    const sleep = ({ seconds }) => new Promise(resolve => {
        console.log(`Пауза ${seconds} сек...`);
        setTimeout(resolve, seconds * 1000);
    });

    const safeClickConfirm = () => {
        try {
            const confirmBtn = document.querySelector($confirmButton);
            if (confirmBtn) {
                confirmBtn.click();
                console.log('✅ Подтвердили отписку!');
                return true;
            } else {
                console.log('❌ Не нашли кнопку подтверждения (data-testid).');
                return false;
            }
        } catch (error) {
            console.log('Ошибка при клике подтверждения:', error.message);
            return false;
        }
    };

    const unfollowNext = async (followButtons) => {
        if (unfollowed >= maxUnfollows) {
            console.log(`Готово! Отписано от ${unfollowed}. Обнови страницу и запусти заново.`);
            return;
        }

        if (followButtons.length === 0) {
            console.log('Нет кнопок — прокручиваем...');
            scrollToTheBottom();
            await sleep({ seconds: 3 });
            return unfollowNext([...document.querySelectorAll($followButtons)]);
        }

        const btn = followButtons[0];
        console.log('Кликнули Following...');
        btn.click();
        await sleep({ seconds: 2.5 }); // Ждём модалку

        let success = false;
        for (let i = 0; i < retry.limit; i++) {
            retry.count = i + 1;
            console.log(`Попытка подтверждения ${retry.count}/${retry.limit}...`);
            success = safeClickConfirm();
            if (success) break;
            await sleep({ seconds: 1 });
        }

        if (success) {
            unfollowed++;
            console.log(`Отписались! Итого: ${unfollowed}/${maxUnfollows}`);
            retry.count = 0;
        } else {
            console.log('❌ Retry исчерпан — пропускаем аккаунт.');
            retry.count = 0;
        }

        scrollToTheBottom();
        await sleep({ seconds: 1 });
        followButtons.shift(); // Следующая кнопка
        await unfollowNext(followButtons);
    };

    console.log('🚀 Скрипт запущен (JamieMason 2025 версия с фиксами).');
    unfollowNext([...document.querySelectorAll($followButtons)]).catch(console.error);
})();
