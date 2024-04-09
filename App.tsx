import {
  Button,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { OpenAI, isReactElement, useChat } from "react-native-gen-ui";
import { z } from "zod";

const openAi = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "",
  model: process.env.EXPO_PUBLIC_OPENAI_MODEL || "gpt-4",
});

export default function App() {
  const { input, messages, isLoading, handleSubmit, onInputChange } = useChat({
    openAi,
    initialMessages: [
      { content: "Hi! How can I help you today?", role: "assistant" },
    ],
    onSuccess: (messages) => console.log("Chat success:", messages),
    onError: (error) => console.error("Chat error:", error),
    tools: {
      // Example function - roll a dice
      rollDice: {
        description: "Roll a dice",
        parameters: z.object({}),
        render: async function* () {
          return {
            component: <></>,
            data: {
              // Random number between 1 and 6
              result: Math.floor(Math.random() * 6) + 1,
            },
          };
        },
      },
    },
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View style={{ flex: 1, display: "flex", paddingHorizontal: 20 }}>
        <FlatList
          data={messages}
          inverted
          style={{ flexGrow: 1 }}
          fadingEdgeLength={10}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{
            flexDirection: "column-reverse",
            padding: 12,
          }}
          renderItem={({ item, index }) => {
            const isLast = index === messages.length - 1;

            if (isReactElement(item)) {
              // Message can React component or string (see function calling section for more details)
              return item;
            }

            switch (item.role) {
              case "user":
                // User sent messages
                return (
                  <Text
                    style={{
                      color: "blue",
                      paddingVertical: 8,
                    }}
                    key={index}
                  >
                    {item.content?.toString()}
                  </Text>
                );
              case "assistant":
                // Assistant responses
                return (
                  <Text key={index} style={{ paddingVertical: 8 }}>
                    {item.content?.toString()}
                  </Text>
                );
              default:
                // This includes tool calls, tool results and system messages
                // Those are visible to the model, but here we hide them to the user
                return null;
            }
          }}
        />
        <View
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Text input for user to type messages + send button */}
          <TextInput
            value={input}
            style={{
              flex: 1,
              padding: 10,
              borderWidth: 1,
              color: "black",
              borderColor: "black",
            }}
            onChangeText={onInputChange}
          />
          <Button
            onPress={() => handleSubmit(input)}
            title="Send"
            disabled={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
