#include <ctype.h>
#include <stdio.h>

typedef enum {
    INTEGER,
    PLUS,
    EOFILE
} TokenType;

typedef struct {
    TokenType type;
    union {
        int digit;
        char op;
    } value;
} Token;

typedef  struct {
    char *text;
    int text_length;
    int pos;
    Token current_token;
} Interpreter;

int to_digit(char digit_char) {
    switch (digit_char) {
        case '0':
            return 0;
        case '1':
            return 1;
        case '2':
            return 2;
        case '3':
            return 3;
        case '4':
            return 4;
        case '5':
            return 5;
        case '6':
            return 6;
        case '7':
            return 7;
        case '8':
            return 8;
        case '9':
            return 9;
        default:
            return 0;
    }
}

Token get_next_token(Interpreter *interpreter) {
    if (
        interpreter->pos == (interpreter->text_length - 1) ||
        interpreter->text[interpreter->pos] == '\0'
    )
        return (Token) { .type = EOFILE, .value.op = '\0' };

    else if (isdigit(interpreter->text[interpreter->pos])) {
        Token token = {  .type = INTEGER, .value.digit = to_digit(interpreter->text[interpreter->pos]) };
        interpreter->pos++;

        return token;
    }

    else if (interpreter->text[interpreter->pos] == '+') {
        Token token = { .type = PLUS, .value.op = '+' };
        interpreter->pos++;

        return  token;
    }
}

void eat(TokenType token_type, Interpreter *interpreter) {
    if (token_type == interpreter->current_token.type)
        interpreter->current_token = get_next_token(interpreter);
}

int expr(Interpreter *interpreter) {
    interpreter->current_token = get_next_token(interpreter);

    Token left = interpreter->current_token;
    eat(INTEGER, interpreter);

    Token op = interpreter->current_token;
    eat(PLUS, interpreter);

    Token right = interpreter->current_token;
    eat(INTEGER, interpreter);

    return left.value.digit + right.value.digit;
}

int read_line(char input[], int input_length) {
    char c;
    int i = 0;

    while ((c = getchar()) != '\n') {
        if (i < input_length - 1)
            input[i++] = c;
    }

    input[i + 1] = '\0';

    return i;
}

int main() {
    char text[4];
    int result;

    while (1) {
        printf("calc> ");
        read_line(text, 4);

        Interpreter interpreter = { .text = text, .pos = 0, .text_length = 4 };
        result = expr(&interpreter);
        printf("%d\n", result);
    }
}
